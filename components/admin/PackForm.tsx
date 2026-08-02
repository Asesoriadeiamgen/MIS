"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPack, updatePack } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import type { Pack } from "@/types/database";

export default function PackForm(props: { pack?: Pack }) {
  const router = useRouter();
  const editing = !!props.pack;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(props.pack?.image_urls || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("covers").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setImageUrls((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("image_urls", imageUrls.join(","));
    setSaving(true);
    setError(null);
    try {
      if (editing && props.pack) {
        await updatePack(props.pack.id, formData);
        router.push("/admin/formaciones");
        return;
      }
      await createPack(formData);
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
      <input
        name="name"
        placeholder="Nombre de la formación"
        defaultValue={props.pack?.name}
        required
        className={INPUT}
      />
      <PriceField name="price" defaultValue={props.pack?.price} placeholder="Valor" />
      <div className="flex gap-2">
        <input
          name="sessions_count"
          type="number"
          min={1}
          placeholder="Cantidad"
          defaultValue={props.pack?.sessions_count ?? ""}
          className={`${INPUT} flex-1`}
        />
        <select
          name="duration_unit"
          defaultValue={props.pack?.duration_unit ?? "sesiones"}
          className={INPUT}
        >
          <option value="sesiones">Sesiones</option>
          <option value="meses">Meses</option>
          <option value="semanas">Semanas</option>
          <option value="dias">Días</option>
          <option value="horas">Horas</option>
        </select>
      </div>
      <textarea
        name="description"
        placeholder="Descripción"
        defaultValue={props.pack?.description ?? ""}
        className={`${INPUT} sm:col-span-2`}
      />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Fotos</label>
        {imageUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md border">
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
        <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Actualizar formación" : "Crear formación"}
      </button>
    </form>
  );
}
