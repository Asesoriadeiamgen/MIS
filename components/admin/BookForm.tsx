"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createBook, updateBook } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import PriceField from "@/components/admin/PriceField";
import type { Book } from "@/types/database";

export default function BookForm(props: { book?: Book }) {
  const router = useRouter();
  const editing = !!props.book;
  const formRef = useRef<HTMLFormElement>(null);
  const [coverUrl, setCoverUrl] = useState(props.book?.cover_url || "");
  const [filePath, setFilePath] = useState(props.book?.file_path || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("books").upload(path, file);
    if (!error) setFilePath(path);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("cover_url", coverUrl);
    formData.set("file_path", filePath);
    setSaving(true);
    setError(null);
    try {
      if (editing && props.book) {
        await updateBook(props.book.id, formData);
        router.push("/admin/libros");
        return;
      }
      await createBook(formData);
      formRef.current.reset();
      setCoverUrl("");
      setFilePath("");
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
        placeholder="Título"
        defaultValue={props.book?.title}
        required
        className={INPUT}
      />
      <input name="author" placeholder="Autor" defaultValue={props.book?.author ?? ""} className={INPUT} />
      <PriceField name="price" defaultValue={props.book?.price} />
      <textarea
        name="description"
        placeholder="Descripción"
        defaultValue={props.book?.description ?? ""}
        className={`${INPUT} sm:col-span-2`}
      />
      <div>
        <label className="block text-xs text-gray-500 mb-1">Portada (imagen)</label>
        <input type="file" accept="image/*" onChange={handleCoverChange} />
        {coverUrl && <p className="text-xs text-green-600 mt-1">Portada {editing ? "cargada" : "subida"} ✓</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Archivo del libro (PDF, o ZIP si son varios archivos)
        </label>
        <input
          type="file"
          accept="application/pdf,.zip,application/zip,application/x-zip-compressed"
          onChange={handleFileChange}
        />
        {filePath && <p className="text-xs text-green-600 mt-1">Archivo {editing ? "cargado" : "subido"} ✓</p>}
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={uploading || saving}
        className={`sm:col-span-2 ${BUTTON_PRIMARY}`}
      >
        {saving ? "Guardando..." : editing ? "Actualizar libro" : "Crear libro"}
      </button>
    </form>
  );
}
