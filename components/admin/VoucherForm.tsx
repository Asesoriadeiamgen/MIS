"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/imageCompress";
import { createVoucher, updateVoucher } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import type { Voucher } from "@/types/database";

export default function VoucherForm(props: { voucher?: Voucher }) {
  const router = useRouter();
  const editing = !!props.voucher;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(props.voucher?.image_url ?? "");
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
      setImageUrl(data.publicUrl);
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
      if (editing && props.voucher) {
        await updateVoucher(props.voucher.id, formData);
        router.push("/admin/vouchers");
        return;
      }
      await createVoucher(formData);
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
        placeholder="Nombre (ej: Voucher $50.000)"
        required
        defaultValue={props.voucher?.name ?? ""}
        className={INPUT}
      />
      <PriceField name="price" defaultValue={props.voucher?.price ?? null} />
      <textarea
        name="description"
        placeholder="Descripción (opcional)"
        rows={3}
        defaultValue={props.voucher?.description ?? ""}
        className={`sm:col-span-2 ${INPUT}`}
      />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-500">Foto (opcional)</label>
        {imageUrl && (
          <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-md border">
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
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar voucher"}
      </button>
    </form>
  );
}
