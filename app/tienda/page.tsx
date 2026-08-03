import type { Metadata } from "next";
import Link from "next/link";
import { IconTienda, IconBlog, IconCurso } from "@/components/icons";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Tienda";
const description = `Ebooks, guías descargables y cursos online de ${SITE_NAME}.`;
const keywords = ["ebooks de imagen personal", "guías descargables", "cursos online de imagen"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/tienda" },
  ...buildSocialMeta({ title, description, path: "/tienda" }),
};

const SECTIONS = [
  { href: "/libros", title: "Ebooks y guías", description: "PDFs descargables, acceso protegido.", Icon: IconBlog },
  { href: "/cursos", title: "Cursos online", description: "Cursos con fecha de inicio.", Icon: IconCurso },
];

export default function TiendaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl">
        <IconTienda className="h-8 w-8" />
        Tienda
      </h1>
      <p className="mb-8 text-[#1a1a1a]/70">Ebooks, guías descargables y cursos online.</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SECTIONS.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-3 rounded-sm border border-black/10 bg-white px-5 py-12 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <Icon className="h-9 w-9 text-lilac-deep" />
            <h2 className="font-serif text-xl">{title}</h2>
            <p className="text-xs text-[#1a1a1a]/60">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
