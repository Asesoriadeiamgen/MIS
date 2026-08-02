import Link from "next/link";
import Image from "next/image";
import { IconInstagram, IconMail } from "@/components/icons";
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL, INSTAGRAM_ACCOUNTS } from "@/lib/seo";

const SECTIONS = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/servicios", label: "Servicios" },
  { href: "/packs", label: "Formación" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/blog", label: "Blog" },
  { href: "/libros", label: "Ebooks" },
  { href: "/tienda", label: "Tienda" },
  { href: "/faq", label: "FAQ" },
  { href: "/agenda", label: "Agendá tu turno" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-soft-bg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-10 text-center">
        <span className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="flex flex-col items-center text-center leading-tight">
            <span className="font-serif text-base tracking-wide text-[#1a1a1a]">{SITE_NAME}</span>
            <span className="font-script text-base text-lilac-deep">{SITE_TAGLINE}</span>
          </span>
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/70">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="hover:text-lilac-deep">
              {s.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#1a1a1a]/70">
          {INSTAGRAM_ACCOUNTS.map((c) => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#1a1a1a]"
            >
              <IconInstagram className="h-4 w-4" />
              {c.label}
            </a>
          ))}
        </nav>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/70 hover:text-[#1a1a1a]"
        >
          <IconMail className="h-4 w-4" />
          {CONTACT_EMAIL}
        </a>

        <p className="text-xs text-[#1a1a1a]/50">
          © {new Date().getFullYear()} {SITE_NAME} — Hecho con cariño.
        </p>
      </div>
    </footer>
  );
}
