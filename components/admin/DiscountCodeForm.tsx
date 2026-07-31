"use client";

import { useRef, useState } from "react";
import { createDiscountCode } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";

export default function DiscountCodeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<"percent" | "amount">("percent");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setSaving(true);
    await createDiscountCode(new FormData(formRef.current));
    formRef.current.reset();
    setType("percent");
    setSaving(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <input
        name="code"
        placeholder="Código (ej. VERANO10)"
        required
        className={`${INPUT} uppercase sm:col-span-2`}
      />
      <select
        name="discount_type"
        value={type}
        onChange={(e) => setType(e.target.value as "percent" | "amount")}
        className={INPUT}
      >
        <option value="percent">% de descuento</option>
        <option value="amount">Monto fijo ($)</option>
      </select>
      <input
        name="discount_value"
        type="number"
        min={1}
        max={type === "percent" ? 100 : undefined}
        step={type === "percent" ? 1 : 0.01}
        placeholder={type === "percent" ? "Ej. 10" : "Ej. 2000"}
        required
        className={INPUT}
      />
      <button type="submit" disabled={saving} className={`sm:col-span-4 ${BUTTON_PRIMARY}`}>
        {saving ? "Guardando..." : "Crear cupón"}
      </button>
    </form>
  );
}
