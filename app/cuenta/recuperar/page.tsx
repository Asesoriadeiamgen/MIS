"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BUTTON_PRIMARY, INPUT, LABEL } from "@/lib/ui";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cuenta/restablecer`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 font-serif text-3xl">Recuperar contraseña</h1>

      {sent ? (
        <p className="text-sm text-[#2b2622]/80">
          Si el email <strong>{email}</strong> tiene una cuenta, te enviamos un link para elegir una
          contraseña nueva. Revisá tu casilla de entrada (y la carpeta de spam).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={BUTTON_PRIMARY}>
            {loading ? "Enviando..." : "Enviar link de recuperación"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-[#2b2622]/60">
        <Link href="/cuenta/login" className="underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
