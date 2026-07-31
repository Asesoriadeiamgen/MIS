"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BUTTON_PRIMARY, BUTTON_OUTLINE } from "@/lib/ui";
import { SITE_NAME } from "@/lib/seo";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Se muestra como overlay del lado del cliente, nunca del servidor: el HTML
 * que devuelve el servidor es siempre el mismo para todos (personas y bots),
 * así Google indexa la home real y no hay diferencia de contenido por
 * user-agent (eso es "cloaking" y Google lo penaliza — nos pasó una vez).
 * Qué mostrar depende solo de si hay cookie de invitado o sesión iniciada,
 * chequeado después de que la página ya cargó.
 */
export default function WelcomeGateOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasGuestCookie = document.cookie
      .split("; ")
      .some((c) => c === "guest_ok=1");

    if (hasGuestCookie) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShow(true);
    });
  }, []);

  function continueAsGuest() {
    document.cookie = `guest_ok=1; max-age=${TEN_YEARS}; path=/`;
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-sm bg-[#ffffff] px-6 py-10 text-center shadow-lg">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60">
          Bienvenido
        </p>
        <h2 className="font-serif text-3xl leading-tight">{SITE_NAME}</h2>
        <p className="mt-4 text-sm text-[#1a1a1a]/70">
          Iniciá sesión o creá una cuenta para guardar tus pedidos, tus libros y tus datos de
          envío. También podés seguir navegando sin conectarte.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cuenta/login" className={BUTTON_PRIMARY}>
            Iniciar sesión
          </Link>
          <Link href="/cuenta/registro" className={BUTTON_OUTLINE}>
            Crear cuenta
          </Link>
        </div>
        <button
          type="button"
          onClick={continueAsGuest}
          className="mt-6 text-xs uppercase tracking-widest text-[#1a1a1a]/60 underline hover:text-[#1a1a1a]"
        >
          Seguir como invitado
        </button>
      </div>
    </div>
  );
}
