"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import { BUTTON_PRIMARY, INPUT, LABEL } from "@/lib/ui";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function RegistroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    // Todo va en la metadata del signUp (y de ahí a profiles vía el trigger
    // handle_new_user): si la confirmación por email está activada todavía no
    // hay sesión acá, así que un UPDATE a profiles lo bloquearía la RLS
    // (auth.uid() sería null) y se perdían teléfono y cumpleaños en silencio.
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          birth_day: Number(birthDay),
          birth_month: Number(birthMonth),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 font-serif text-3xl">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={`mb-1.5 block ${LABEL}`} htmlFor="fullName">
            Nombre y apellido
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={`mb-1.5 block ${LABEL}`} htmlFor="phone">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <label className={`block ${LABEL}`}>Cumpleaños (día y mes)</label>
            <span className="text-xs font-medium text-lilac-deep">🎁 ¡Te enviamos un regalito!</span>
          </div>
          <div className="flex gap-3">
            <select
              required
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className={INPUT}
            >
              <option value="" disabled>
                Día
              </option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              required
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className={INPUT}
            >
              <option value="" disabled>
                Mes
              </option>
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#1a1a1a]/60">
        ¿Ya tenés cuenta?{" "}
        <Link href="/cuenta/login" className="underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
