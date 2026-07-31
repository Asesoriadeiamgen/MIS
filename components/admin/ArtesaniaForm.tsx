"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createArtesania, updateArtesania } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import { isVideoUrl } from "@/lib/media";
import type { Artesania } from "@/types/database";

const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB

export default function ArtesaniaForm(props: { artesania?: Artesania }) {
  const router = useRouter();
  const editing = !!props.artesania;
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(props.artesania?.image_urls || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const urls: string[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("video/") && file.size > MAX_VIDEO_BYTES) {
        errors.push(`${file.name}: el video pesa más de 20MB, comprimilo antes de subirlo.`);
        continue;
      }
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(path, file);
      if (uploadError) {
        errors.push(`${file.name}: ${uploadError.message}`);
        continue;
      }
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setImageUrls((prev) => [...prev, ...urls]);
    if (errors.length > 0) setError(errors.join(" "));
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
      if (editing && props.artesania) {
        await updateArtesania(props.artesania.id, formData);
        router.push("/admin/artesanias");
        return;
      }
      await createArtesania(formData);
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
        placeholder="Nombre"
        defaultValue={props.artesania?.name}
        required
        className={INPUT}
      />
      <PriceField name="price" defaultValue={props.artesania?.price} />
      <textarea
        name="description"
        placeholder="Descripción"
        defaultValue={props.artesania?.description ?? ""}
        className={`${INPUT} sm:col-span-2`}
      />
      <div className="sm:col-span-2">
        <label className="block text-xs text-gray-500 mb-1">
          Fotos o videos del producto (videos hasta 20MB)
        </label>
        {imageUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md border">
                {isVideoUrl(url) ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-500">
                    🎬 video
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
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
        <input type="file" accept="image/*,video/*" multiple onChange={handleImagesChange} />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={uploading || saving}
        className={`sm:col-span-2 ${BUTTON_PRIMARY}`}
      >
        {saving ? "Guardando..." : editing ? "Actualizar artesanía" : "Crear artesanía"}
      </button>
    </form>
  );
}
