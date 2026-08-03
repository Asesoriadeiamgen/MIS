"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createBlogPost, updateBlogPost } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { BlogPost } from "@/types/database";

export default function BlogPostForm(props: { post?: BlogPost }) {
  const router = useRouter();
  const editing = !!props.post;
  const formRef = useRef<HTMLFormElement>(null);
  const [coverUrl, setCoverUrl] = useState(props.post?.cover_url ?? "");
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
      setCoverUrl(data.publicUrl);
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
      if (editing && props.post) {
        await updateBlogPost(props.post.id, formData);
        router.push("/admin/blog");
        return;
      }
      await createBlogPost(formData);
      formRef.current.reset();
      setCoverUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
      <input
        name="title"
        placeholder="Título"
        defaultValue={props.post?.title}
        required
        className={INPUT}
      />
      <input
        name="slug"
        placeholder="URL (se genera del título si lo dejás vacío)"
        defaultValue={props.post?.slug ?? ""}
        className={INPUT}
      />
      <div>
        <label className="mb-1 block text-xs text-gray-500">Bajada corta (para el listado)</label>
        <RichTextEditor name="excerpt" defaultValue={props.post?.excerpt ?? ""} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Contenido</label>
        <RichTextEditor name="content" defaultValue={props.post?.content ?? ""} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Foto de portada</label>
        {coverUrl && (
          <div className="relative mb-2 h-16 w-28 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverUrl("")}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </div>
        )}
        <input type="file" accept="image/*" disabled={uploading} onChange={handleFile} />
        <input type="hidden" name="cover_url" value={coverUrl} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={uploading || saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : editing ? "Actualizar nota" : "Publicar nota"}
      </button>
    </form>
  );
}
