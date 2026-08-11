import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconTienda, IconBlog, IconCurso, IconFormacion, IconWhatsapp } from "@/components/icons";
import { buildSocialMeta, SITE_NAME, WHATSAPP_NUMBER } from "@/lib/seo";
import { formatPrice, formatPackPrice } from "@/lib/format";

const title = "Tienda";
const description = `Ebooks, guías descargables, cursos online y formaciones de ${SITE_NAME}.`;
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

export default async function TiendaPage() {
  const supabase = await createClient();
  const { data: packs } = await supabase
    .from("packs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl">
        <IconTienda className="h-8 w-8" />
        Tienda
      </h1>
      <p className="mb-8 text-[#1a1a1a]/70">Ebooks, guías descargables, cursos online y formaciones.</p>

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

      {packs && packs.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-2 flex items-center gap-2 font-serif text-2xl">
            <IconFormacion className="h-6 w-6 text-lilac-deep" />
            Formaciones
          </h2>
          <p className="mb-6 text-sm text-[#1a1a1a]/60">
            Por ahora, la inscripción se coordina por WhatsApp.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {packs.map((p) => {
              const total =
                p.duration_unit === "meses" && p.price != null && p.sessions_count
                  ? p.price * p.sessions_count
                  : null;
              const waText = `Hola! Quiero más información para inscribirme en "${p.name}".`;
              const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-sm border border-black/10 bg-white p-5 text-center"
                >
                  <Link href={`/formaciones/${p.id}`} className="hover:text-lilac-deep">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                  </Link>
                  <p className="mt-2 text-sm font-semibold">{formatPackPrice(p.price, p.duration_unit)}</p>
                  {total !== null && (
                    <p className="text-xs text-[#1a1a1a]/50">
                      Total: {formatPrice(total)} ({p.sessions_count} {p.sessions_count === 1 ? "mes" : "meses"})
                    </p>
                  )}
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-4 py-2 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#20bd5a]"
                  >
                    <IconWhatsapp className="h-4 w-4" />
                    Comprar por WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
