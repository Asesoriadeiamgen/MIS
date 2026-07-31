"use client";

import { useState } from "react";
import { createManualBookAccessCode } from "@/app/admin/actions";
import { BUTTON_OUTLINE, INPUT } from "@/lib/ui";

export default function GenerateBookCodeButton({ bookId }: { bookId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const newCode = await createManualBookAccessCode(bookId, email.trim());
      setCode(newCode);
    } catch {
      setError("No se pudo generar el código.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Email (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${INPUT} w-48 text-xs`}
        />
        <button onClick={handleGenerate} disabled={loading} className={`${BUTTON_OUTLINE} text-xs`}>
          {loading ? "Generando..." : "Generar código gratis"}
        </button>
      </div>
      {code && (
        <p className="text-xs text-[#1a1a1a]/70">
          Código: <span className="font-mono font-semibold tracking-wider">{code}</span>
          {email && " · enviado por email"}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
