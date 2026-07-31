"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import { BUTTON_PRIMARY, INPUT, LABEL } from "@/lib/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Tu email todavía no está confirmado. Revisá tu casilla de entrada.");
      } else {
        setError("Email o contraseña incorrectos.");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    const next = searchParams.get("next") || "/";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 font-serif text-3xl">Iniciar sesión</h1>
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
        <div>
          <label className={`mb-1.5 block ${LABEL}`} htmlFor="password">
            Contraseña
          </label>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={BUTTON_PRIMARY}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[#1a1a1a]/60">
        <Link href="/cuenta/recuperar" className="underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="mt-2 text-sm text-[#1a1a1a]/60">
        ¿No tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
