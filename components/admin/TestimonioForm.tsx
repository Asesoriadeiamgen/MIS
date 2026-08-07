"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/imageCompress";
import { createTestimonio, updateTestimonio } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Testimonio } from "@/types/database";

export default function TestimonioForm(props: { testimonio?: Testimonio }) {
  const router = useRouter();
  const editing = !!props.testimonio;
  const formRef = useRef<HTMLFormElement>(null);
  const [photoUrl, setPhotoUrl] = useState(props.testimonio?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const compressed = await compressImage(file);
    const path = `${crypto.randomUUID()}-${compressed.name}`;
    const { error } = await supabase.storage.from("covers").upload(path, compressed);
    if (!error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setSaving(true);
    setError(null);
    try {
      if (editing && props.testimonio) {
        await updateTestimonio(props.testimonio.id, formData);
        router.push("/admin/testimonios");
        return;
      }
      await createTestimonio(formData);
      formRef.current.reset();
      setPhotoUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        name="client_name"
        placeholder="Nombre de la clienta"
        defaultValue={props.testimonio?.client_name}
        required
        className={INPUT}
      />
      <select name="rating" defaultValue={props.testimonio?.rating ?? ""} className={INPUT}>
        <option value="">Sin calificación</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} estrellas
          </option>
        ))}
      </select>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Testimonio</label>
        <RichTextEditor name="quote" defaultValue={props.testimonio?.quote ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Foto (opcional)</label>
        {photoUrl && (
          <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </div>
        )}
        <input type="file" accept="image/*" disabled={uploading} onChange={handleFile} />
        <input type="hidden" name="photo_url" value={photoUrl} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Actualizar" : "Agregar testimonio"}
      </button>
    </form>
  );
}
