"use client";

import { useRef, useState } from "react";
import { createBloqueo } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";

export default function BloqueoForm() {
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
      await createBloqueo(formData);
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Desde</label>
        <input name="start_at" type="datetime-local" required className={INPUT} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Hasta</label>
        <input name="end_at" type="datetime-local" required className={INPUT} />
      </div>
      <input name="reason" placeholder="Motivo (opcional)" className={INPUT} />
      <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : "Bloquear"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
