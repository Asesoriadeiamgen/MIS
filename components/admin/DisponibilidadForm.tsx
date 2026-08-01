"use client";

import { useRef, useState } from "react";
import { createDisponibilidad } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";

const WEEKDAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function DisponibilidadForm() {
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
      await createDisponibilidad(formData);
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1 block text-xs text-gray-500">
          Día{"(s)"} — tildá uno para cargar día por día, o varios para repetir el mismo horario en
          todos a la vez
        </label>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((w) => (
            <label key={w.value} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="weekday" value={w.value} />
              {w.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Desde</label>
        <input name="start_time" type="time" required className={INPUT} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Hasta</label>
        <input name="end_time" type="time" required className={INPUT} />
      </div>
      <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : "Agregar franja"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
