"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAboutPage } from "@/app/admin/actions";
import { BUTTON_PRIMARY } from "@/lib/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { AboutPage } from "@/types/database";

export default function AboutPageForm(props: { about: AboutPage | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [photoUrl, setPhotoUrl] = useState(props.about?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
    try {
      await updateAboutPage(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Foto</label>
        {photoUrl && (
          <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-md border">
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

      <div>
        <label className="mb-1 block text-xs text-gray-500">Formación y certificaciones</label>
        <RichTextEditor name="formacion_html" defaultValue={props.about?.formacion_html ?? ""} />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Filosofía de trabajo</label>
        <RichTextEditor name="filosofia_html" defaultValue={props.about?.filosofia_html ?? ""} />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Mi historia</label>
        <RichTextEditor name="historia_html" defaultValue={props.about?.historia_html ?? ""} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-green-700">Guardado.</p>}
      <button type="submit" disabled={uploading || saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
