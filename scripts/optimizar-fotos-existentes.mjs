// Recomprime todas las imágenes ya subidas al bucket "covers" de Supabase
// Storage, en el mismo lugar (mismo path, mismo public URL), para no romper
// ninguna referencia guardada en la base. Es una herramienta puntual, no una
// dependencia del sitio en producción: requiere `npm install sharp --no-save`
// antes de correrla.
//
// Uso: node scripts/optimizar-fotos-existentes.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_DIMENSION = 1920;
const QUALITY = 82;
const BUCKET = "covers";

function loadEnvLocal() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: files, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  if (error) throw error;

  let processed = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const file of files) {
    const originalSize = file.metadata?.size ?? 0;
    const contentType = file.metadata?.mimetype ?? "";
    if (!contentType.startsWith("image/") || contentType === "image/svg+xml" || contentType === "image/gif") {
      skipped++;
      continue;
    }

    const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(file.name);
    if (downloadError) {
      console.error(`No se pudo descargar ${file.name}:`, downloadError.message);
      continue;
    }
    const buffer = Buffer.from(await blob.arrayBuffer());

    let optimized;
    try {
      optimized = await sharp(buffer)
        .rotate() // respeta la orientación EXIF antes de perderla al recomprimir
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: QUALITY })
        .toBuffer();
    } catch (err) {
      console.error(`No se pudo procesar ${file.name}:`, err.message);
      continue;
    }

    if (optimized.length >= originalSize) {
      skipped++;
      continue;
    }

    const { error: uploadError } = await supabase.storage.from(BUCKET).update(file.name, optimized, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (uploadError) {
      console.error(`No se pudo subir ${file.name}:`, uploadError.message);
      continue;
    }

    const saved = originalSize - optimized.length;
    savedBytes += saved;
    processed++;
    console.log(
      `${file.name}: ${(originalSize / 1024).toFixed(0)}KB -> ${(optimized.length / 1024).toFixed(0)}KB`
    );
  }

  console.log(`\nListo. Optimizadas: ${processed}. Sin cambios/omitidas: ${skipped}.`);
  console.log(`Espacio ahorrado: ${(savedBytes / 1024 / 1024).toFixed(1)} MB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
