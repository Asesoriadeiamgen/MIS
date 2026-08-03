import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { IconFormacion } from "@/components/icons";
import { formatDuration } from "@/lib/format";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Formaciones";
const description = `Formaciones de ${SITE_NAME}: carreras, especializaciones y mentorías para asesoras de imagen.`;
const keywords = [
  "carrera de asesoría de imagen",
  "formación asesoría de imagen",
  "curso para asesoras de imagen",
  "mentoría imagen personal",
  "especialización coaching de imagen",
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/formaciones" },
  ...buildSocialMeta({ title, description, path: "/formaciones" }),
};

export default async function PacksPage() {
  const supabase = await createClient();
  const { data: packs } = await supabase
    .from("packs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Formaciones</h1>
      <p className="mb-8 text-[#1a1a1a]/70">
        Carreras, especializaciones y mentorías para asesoras de imagen.
      </p>
      {!packs || packs.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay programas publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {packs.map((p) => (
            <ProductCard
              key={p.id}
              href={`/formaciones/${p.id}`}
              image={p.image_urls?.[0] ?? null}
              title={p.name}
              subtitle={formatDuration(p.sessions_count, p.duration_unit)}
              price={p.price}
              priceSuffix={p.duration_unit === "meses" ? "/ mes" : undefined}
              icon={IconFormacion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
