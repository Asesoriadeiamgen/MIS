import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { formatDate } from "@/lib/format";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Cursos y talleres";
const description = `Cursos y talleres de ${SITE_NAME}: fecha de inicio, duración y valor de cada uno. Consultá por WhatsApp antes de anotarte.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cursos" },
  ...buildSocialMeta({ title, description, path: "/cursos" }),
};

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Cursos</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Cursos y talleres con fecha de inicio y duración. Consultá por WhatsApp antes de anotarte.
      </p>
      {!cursos || cursos.length === 0 ? (
        <p className="text-sm text-[#2b2622]/50">Todavía no hay cursos publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {cursos.map((curso) => (
            <ProductCard
              key={curso.id}
              href={`/cursos/${curso.id}`}
              image={curso.image_urls?.[0] ?? null}
              title={curso.name}
              subtitle={curso.start_date ? `Comienza ${formatDate(curso.start_date)}` : null}
              price={curso.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
