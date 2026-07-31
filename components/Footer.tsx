import Link from "next/link";
import Image from "next/image";
import { IconInstagram, IconMail } from "@/components/icons";
import { SITE_NAME, CONTACT_EMAIL, INSTAGRAM_ACCOUNTS } from "@/lib/seo";

const SECTIONS = [
  { href: "/libros", label: "Libros" },
  { href: "/agendas", label: "Agendas" },
  { href: "/artesanias", label: "Artesanías" },
  { href: "/varios", label: "Varios" },
  { href: "/cursos", label: "Cursos" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-lilac/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-10 text-center">
        <span className="flex items-center gap-2 font-serif text-lg tracking-wide">
          <Image src="/logo-icon.png" alt={SITE_NAME} width={28} height={28} className="h-7 w-7" />
          {SITE_NAME}
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium uppercase tracking-widest text-[#2b2622]/70">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="hover:text-[#2b2622]">
              {s.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#2b2622]/70">
          {INSTAGRAM_ACCOUNTS.map((c) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#2b2622]"
            >
              <IconInstagram className="h-4 w-4" />
              {c.label}
            </a>
          ))}
        </nav>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-1.5 text-xs text-[#2b2622]/70 hover:text-[#2b2622]"
        >
          <IconMail className="h-4 w-4" />
          {CONTACT_EMAIL}
        </a>

        <p className="text-xs text-[#2b2622]/50">
          © {new Date().getFullYear()} {SITE_NAME} — Hecho con cariño.
        </p>
      </div>
    </footer>
  );
}
