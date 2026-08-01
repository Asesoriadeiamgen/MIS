"use client";

import { useState } from "react";
import Link from "next/link";
import CartBadge from "@/components/CartBadge";
import { IconMenu, IconClose } from "@/components/icons";

const SECTIONS = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/servicios", label: "Servicios" },
  { href: "/packs", label: "Packs" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/blog", label: "Blog" },
  { href: "/libros", label: "Ebooks" },
  { href: "/tienda", label: "Tienda" },
  { href: "/faq", label: "FAQ" },
  { href: "/agenda", label: "Agendá tu turno" },
];

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="hidden items-center gap-5 text-xs font-medium uppercase tracking-widest xl:flex">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="text-center hover:text-lilac-deep">
            {s.label}
          </Link>
        ))}
        <CartBadge />
        {isLoggedIn ? (
          <Link href="/cuenta/perfil" className="hover:text-lilac-deep">
            Mi cuenta
          </Link>
        ) : (
          <Link href="/cuenta/login" className="hover:text-lilac-deep">
            Ingresar
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex items-center justify-center p-2 text-[#1a1a1a] xl:hidden"
      >
        {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-black/10 bg-[#ffffff] px-4 py-4 shadow-sm xl:hidden">
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
