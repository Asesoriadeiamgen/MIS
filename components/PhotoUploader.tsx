"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UploadedPhoto {
  path: string;
  previewUrl: string;
}

export default function PhotoUploader(props: {
  bucket: "agenda-photos" | "artesania-photos";
  userId: string;
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const max = props.max ?? 5;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - props.photos.length;
    if (remaining <= 0) {
      setError(`Máximo ${max} fotos.`);
      return;
    }

    const supabase = createClient();
    setUploading(true);
    const uploaded: UploadedPhoto[] = [];

    for (const file of Array.from(files).slice(0, remaining)) {
      const path = `${props.userId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(props.bucket).upload(path, file);
      if (uploadError) {
        setError("No se pudo subir una de las fotos. Probá de nuevo.");
        continue;
      }
      const { data: signed } = await supabase.storage
        .from(props.bucket)
        .createSignedUrl(path, 60 * 60);
      uploaded.push({ path, previewUrl: signed?.signedUrl || "" });
    }

    props.onChange([...props.photos, ...uploaded]);
    setUploading(false);
  }

  function removePhoto(path: string) {
    props.onChange(props.photos.filter((p) => p.path !== path));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {props.photos.map((photo) => (
          <div key={photo.path} className="relative h-20 w-20 overflow-hidden rounded-md border">
            {photo.previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removePhoto(photo.path)}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
        {props.photos.length < max && (
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs text-gray-500">
            {uploading ? "Subiendo..." : "+ Foto"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
