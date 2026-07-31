"use client";

import { useRef, useState } from "react";
import { createBookPromoCode } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";
import type { Book } from "@/types/database";

export default function BookPromoCodeForm({ books }: { books: Book[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setSaving(true);
    setError(null);
    try {
      await createBookPromoCode(new FormData(formRef.current));
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el código.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <select name="book_id" required defaultValue="" className={`${INPUT} sm:col-span-2`}>
        <option value="" disabled>
          Elegí un libro
        </option>
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>
      <input
        name="code"
        placeholder="Código (ej. LIBROGRATIS)"
        required
        className={`${INPUT} uppercase`}
      />
      <button type="submit" disabled={saving} className={BUTTON_PRIMARY}>
        {saving ? "Guardando..." : "Crear código"}
      </button>
      {error && <p className="sm:col-span-4 text-sm text-red-600">{error}</p>}
    </form>
  );
}
