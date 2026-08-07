"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/imageCompress";
import { createPortfolioItem, updatePortfolioItem } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { PortfolioItem } from "@/types/database";

function ImageField(props: {
  label: string;
  name: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

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
      props.onChange(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{props.label}</label>
      {props.value && (
        <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => props.onChange("")}
            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
          >
            ×
          </button>
        </div>
      )}
      <input type="file" accept="image/*" disabled={uploading} onChange={handleFile} />
      <input type="hidden" name={props.name} value={props.value} />
    </div>
  );
}

export default function PortfolioForm(props: { item?: PortfolioItem }) {
  const router = useRouter();
  const editing = !!props.item;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(props.item?.image_url ?? "");
  const [beforeUrl, setBeforeUrl] = useState(props.item?.before_image_url ?? "");
  const [afterUrl, setAfterUrl] = useState(props.item?.after_image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setSaving(true);
    setError(null);
    try {
      if (editing && props.item) {
        await updatePortfolioItem(props.item.id, formData);
        router.push("/admin/portfolio");
        return;
      }
      await createPortfolioItem(formData);
      formRef.current.reset();
      setImageUrl("");
      setBeforeUrl("");
      setAfterUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        name="title"
        placeholder="Título (opcional)"
        defaultValue={props.item?.title ?? ""}
        className={INPUT}
      />
      <div />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Descripción (opcional)</label>
        <RichTextEditor name="description" defaultValue={props.item?.description ?? ""} />
      </div>
      <p className="text-xs text-gray-500 sm:col-span-2">
        Cargá antes/después, o una sola foto si no aplica la comparación.
      </p>
      <ImageField label="Antes" name="before_image_url" value={beforeUrl} onChange={setBeforeUrl} />
      <ImageField label="Después" name="after_image_url" value={afterUrl} onChange={setAfterUrl} />
      <ImageField label="Foto única" name="image_url" value={imageUrl} onChange={setImageUrl} />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Actualizar" : "Agregar al portfolio"}
      </button>
    </form>
  );
}
