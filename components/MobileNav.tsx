"use client";

import { useState } from "react";
import Link from "next/link";
import CartBadge from "@/components/CartBadge";
import { IconMenu, IconClose, IconPerfil } from "@/components/icons";

const SECTIONS = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/servicios", label: "Servicios" },
  { href: "/formaciones", label: "Formaciones" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/blog", label: "Blog" },
  { href: "/tienda", label: "Tienda" },
  { href: "/faq", label: "FAQ" },
  { href: "/agenda", label: "Agendá tu turno" },
];

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="hidden items-center gap-2.5 whitespace-nowrap text-xs font-medium uppercase tracking-wide min-[1024px]:flex">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="hover:text-lilac-deep">
            {s.label}
          </Link>
        ))}
        <CartBadge showLabel={false} />
        {isLoggedIn ? (
          <Link href="/cuenta/perfil" aria-label="Mi cuenta" title="Mi cuenta" className="hover:text-lilac-deep">
            <IconPerfil className="h-4 w-4" />
          </Link>
        ) : (
          <Link href="/cuenta/login" aria-label="Ingresar" title="Ingresar" className="hover:text-lilac-deep">
            <IconPerfil className="h-4 w-4" />
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex items-center justify-center p-2 text-[#1a1a1a] min-[1024px]:hidden"
      >
        {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-black/10 bg-[#ffffff] px-4 py-4 shadow-sm min-[1024px]:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium uppercase tracking-widest">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} onClick={close} className="hover:text-lilac-deep">
                {s.label}
              </Link>
            ))}
            <div onClick={close}>
              <CartBadge />
            </div>
            {isLoggedIn ? (
              <Link href="/cuenta/perfil" onClick={close} className="hover:text-lilac-deep">
                Mi cuenta
              </Link>
            ) : (
              <Link href="/cuenta/login" onClick={close} className="hover:text-lilac-deep">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
