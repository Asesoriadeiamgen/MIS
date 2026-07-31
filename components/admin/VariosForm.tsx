"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createVariosProduct, updateVariosProduct } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import type { VariosProduct } from "@/types/database";

export default function VariosForm(props: { item?: VariosProduct }) {
  const router = useRouter();
  const editing = !!props.item;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(props.item?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    const formData = new FormData(formRef.current);
    formData.set("image_url", imageUrl);
    setSaving(true);
    setError(null);
    try {
      if (editing && props.item) {
        await updateVariosProduct(props.item.id, formData);
        router.push("/admin/varios");
        return;
      }
      await createVariosProduct(formData);
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
      <input
        name="name"
        placeholder="Nombre"
        defaultValue={props.item?.name}
        required
        className={INPUT}
      />
      <PriceField name="price" defaultValue={props.item?.price} />
      <textarea
        name="description"
        placeholder="Descripción"
        defaultValue={props.item?.description ?? ""}
        className={`${INPUT} sm:col-span-2`}
      />
      <div className="sm:col-span-2">
        <label className="block text-xs text-gray-500 mb-1">Foto</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imageUrl && <p className="text-xs text-green-600 mt-1">Foto {editing ? "cargada" : "subida"} ✓</p>}
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={uploading || saving}
        className={`sm:col-span-2 ${BUTTON_PRIMARY}`}
      >
        {saving ? "Guardando..." : editing ? "Actualizar producto" : "Crear producto"}
      </button>
    </form>
  );
}
