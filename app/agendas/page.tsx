import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta } from "@/lib/seo";

const title = "Agendas personalizadas — Colores, fotos y frases a tu gusto";
const description =
  "Agendas personalizadas con mandalas para pintar: elegí colores, subí tus fotos y agregá frases. Coordinamos el envío por WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/agendas" },
  ...buildSocialMeta({ title, description, path: "/agendas" }),
};

export default async function AgendasPage() {
  const supabase = await createClient();
  const { data: agendas } = await supabase
    .from("agendas")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Agendas</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Elegí un diseño base y personalizalo: color, tamaño y hasta tus propias fotos.
      </p>
      {!agendas || agendas.length === 0 ? (
        <p className="text-sm text-[#2b2622]/50">Todavía no hay diseños publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {agendas.map((agenda) => (
            <ProductCard
              key={agenda.id}
              href={`/agendas/${agenda.id}`}
              image={agenda.cover_url}
              title={agenda.name}
              price={agenda.base_price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
