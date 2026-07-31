"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createFaq, updateFaq } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import type { Faq } from "@/types/database";

export default function FaqForm(props: { faq?: Faq }) {
  const router = useRouter();
  const editing = !!props.faq;
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
      if (editing && props.faq) {
        await updateFaq(props.faq.id, formData);
        router.push("/admin/faq");
        return;
      }
      await createFaq(formData);
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
      <input
        name="question"
        placeholder="Pregunta"
        defaultValue={props.faq?.question}
        required
        className={INPUT}
      />
      <textarea
        name="answer"
        placeholder="Respuesta"
        defaultValue={props.faq?.answer}
        required
        className={INPUT}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : editing ? "Actualizar" : "Agregar pregunta"}
      </button>
    </form>
  );
}
