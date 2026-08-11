import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconTienda } from "@/components/icons";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Tienda";
const description = `Ebooks, guías descargables, cursos online, formaciones y consultorías de ${SITE_NAME}.`;
const keywords = ["ebooks de imagen personal", "guías descargables", "cursos online de imagen"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/tienda" },
  ...buildSocialMeta({ title, description, path: "/tienda" }),
};

export default async function TiendaPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase
    .from("tienda_categorias")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center">
      <h1 className="mb-2 flex items-center justify-center gap-2 font-serif text-3xl">
        <IconTienda className="h-8 w-8" />
        Tienda
      </h1>
      <p className="mb-8 text-[#1a1a1a]/70">Elegí qué querés ver.</p>

      {!categorias || categorias.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay categorías publicadas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="group flex flex-col items-center gap-3 rounded-sm border border-black/10 bg-white px-5 py-12 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {c.emoji && <span className="text-4xl">{c.emoji}</span>}
              <h2 className="font-serif text-xl">{c.title}</h2>
              {c.description && <p className="text-xs text-[#1a1a1a]/60">{c.description}</p>}
              <span className="mt-2 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-lilac-deep transition group-hover:gap-2">
                Ver más
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
