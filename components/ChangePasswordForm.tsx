"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import { BUTTON_OUTLINE, LABEL } from "@/lib/ui";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div>
        <label className={`mb-1.5 block ${LABEL}`} htmlFor="newPassword">
          Nueva contraseña
        </label>
        <PasswordInput
          id="newPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
      </div>
      <div>
        <label className={`mb-1.5 block ${LABEL}`} htmlFor="confirmNewPassword">
          Repetir contraseña
        </label>
        <PasswordInput
          id="confirmNewPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>
      {done && <p className="text-sm text-green-700">Tu contraseña se actualizó.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={`self-start ${BUTTON_OUTLINE}`}>
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
