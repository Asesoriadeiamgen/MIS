"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/imageCompress";
import { createGaleriaFoto, updateGaleriaFoto } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import type { GaleriaFoto } from "@/types/database";

export default function GaleriaFotoForm(props: {
  foto?: GaleriaFoto;
  categories: string[];
  subcategories: string[];
}) {
  const router = useRouter();
  const editing = !!props.foto;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(props.foto ? [props.foto.image_url] : []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const compressed = await compressImage(file);
      const path = `${crypto.randomUUID()}-${compressed.name}`;
      const { error } = await supabase.storage.from("covers").upload(path, compressed);
      if (!error) {
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    setImageUrls((prev) => (editing ? uploaded.slice(0, 1) : [...prev, ...uploaded]));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    if (imageUrls.length === 0) {
      setError(editing ? "Subí una foto." : "Subí al menos una foto.");
      return;
    }
    const formData = new FormData(formRef.current);
    formData.set("image_urls", imageUrls.join(","));
    setSaving(true);
    setError(null);
    try {
      if (editing && props.foto) {
        await updateGaleriaFoto(props.foto.id, formData);
        router.push("/admin/galeria");
        return;
      }
      await createGaleriaFoto(formData);
      formRef.current.reset();
      setImageUrls([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Categoría (carpeta)</label>
        <input
          name="category"
          list="galeria-categorias"
          placeholder="Ej: Asesoría Personal"
          required
          defaultValue={props.foto?.category ?? ""}
          className={INPUT}
        />
        <datalist id="galeria-categorias">
          {props.categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-gray-500">
          Escribí una categoría existente para agregarla ahí, o una nueva para crear una carpeta.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Subcarpeta (opcional)</label>
        <input
          name="subcategory"
          list="galeria-subcategorias"
          placeholder="Ej: Charla en Universidad X"
          defaultValue={props.foto?.subcategory ?? ""}
          className={INPUT}
        />
        <datalist id="galeria-subcategorias">
          {props.subcategories.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-gray-500">
          Si la dejás vacía, la foto queda directo dentro de la categoría. Usala para agrupar series
          dentro de una misma categoría (ej: cada charla dentro de "Charlas Institucionales").
        </p>
      </div>
      <input
        name="caption"
        placeholder="Descripción (opcional)"
        defaultValue={props.foto?.caption ?? ""}
        className={INPUT}
      />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">
          {editing ? "Foto" : "Fotos (podés elegir varias juntas, van todas a la misma categoría)"}
        </label>
        {imageUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple={!editing} disabled={uploading} onChange={handleFiles} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar foto(s)"}
      </button>
    </form>
  );
}
