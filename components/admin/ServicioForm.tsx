"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createServicio, updateServicio } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import type { Servicio } from "@/types/database";

export default function ServicioForm(props: { servicio?: Servicio }) {
  const router = useRouter();
  const editing = !!props.servicio;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(props.servicio?.image_urls || []);
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
      if (editing && props.servicio) {
        await updateServicio(props.servicio.id, formData);
        router.push("/admin/servicios");
        return;
      }
      await createServicio(formData);
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
        placeholder="Nombre del servicio"
        defaultValue={props.servicio?.name}
        required
        className={INPUT}
      />
      <PriceField name="price" defaultValue={props.servicio?.price} placeholder="Valor" />
      <div>
        <label className="mb-1 block text-xs text-gray-500">Modalidad</label>
        <select name="modalidad" defaultValue={props.servicio?.modalidad ?? "ambas"} className={INPUT}>
          <option value="ambas">Online y presencial</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>
      <textarea
        name="description"
        placeholder="Descripción"
        defaultValue={props.servicio?.description ?? ""}
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
        {saving ? "Guardando..." : editing ? "Actualizar servicio" : "Crear servicio"}
      </button>
    </form>
  );
}
