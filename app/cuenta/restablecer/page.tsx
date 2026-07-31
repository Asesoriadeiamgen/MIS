"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import { BUTTON_PRIMARY, LABEL } from "@/lib/ui";

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(
        "No pudimos actualizar tu contraseña. El link puede haber expirado — pedí uno nuevo desde 'Olvidaste tu contraseña'."
      );
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/cuenta/perfil");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 font-serif text-3xl">Elegir nueva contraseña</h1>

      {done ? (
        <p className="text-sm text-[#1a1a1a]/80">Contraseña actualizada. Te estamos redirigiendo...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="password">
              Nueva contraseña
            </label>
            <PasswordInput
              id="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
          </div>
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="confirmPassword">
              Repetir contraseña
            </label>
            <PasswordInput
              id="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={BUTTON_PRIMARY}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}
