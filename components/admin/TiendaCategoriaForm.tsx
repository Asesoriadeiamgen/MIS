"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTiendaCategoria, updateTiendaCategoria } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import type { TiendaCategoria } from "@/types/database";

export default function TiendaCategoriaForm(props: { categoria?: TiendaCategoria }) {
  const router = useRouter();
  const editing = !!props.categoria;
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setSaving(true);
    setError(null);
    try {
      if (editing && props.categoria) {
        await updateTiendaCategoria(props.categoria.id, formData);
        router.push("/admin/tienda-categorias");
        return;
      }
      await createTiendaCategoria(formData);
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        name="emoji"
        placeholder="Emoji (ej: 📘)"
        defaultValue={props.categoria?.emoji ?? ""}
        className={INPUT}
      />
      <input
        name="title"
        placeholder="Título (ej: Formaciones)"
        required
        defaultValue={props.categoria?.title ?? ""}
        className={INPUT}
      />
      <input
        name="href"
        placeholder="Link (ej: /formaciones)"
        required
        defaultValue={props.categoria?.href ?? ""}
        className={`sm:col-span-2 ${INPUT}`}
      />
      <textarea
        name="description"
        placeholder="Descripción corta"
        rows={2}
        defaultValue={props.categoria?.description ?? ""}
        className={`sm:col-span-2 ${INPUT}`}
      />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={saving} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar categoría"}
      </button>
    </form>
  );
}
