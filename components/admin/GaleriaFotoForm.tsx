"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createGaleriaFoto, updateGaleriaFoto } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import type { GaleriaFoto } from "@/types/database";

export default function GaleriaFotoForm(props: { foto?: GaleriaFoto; categories: string[] }) {
  const router = useRouter();
  const editing = !!props.foto;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(props.foto?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("covers").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    if (!imageUrl) {
      setError("Subí una foto.");
      return;
    }
    const formData = new FormData(formRef.current);
    formData.set("image_url", imageUrl);
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
      setImageUrl("");
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
      <input
        name="caption"
        placeholder="Descripción (opcional)"
        defaultValue={props.foto?.caption ?? ""}
        className={INPUT}
      />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Foto</label>
        {imageUrl && (
          <div className="relative mb-2 h-20 w-20 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </div>
        )}
        <input type="file" accept="image/*" disabled={uploading} onChange={handleFile} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar foto"}
      </button>
    </form>
  );
}
