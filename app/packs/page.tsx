import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Packs y programas";
const description = `Packs y programas de ${SITE_NAME}: sesión individual o proceso de varios encuentros.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/packs" },
  ...buildSocialMeta({ title, description, path: "/packs" }),
};

export default async function PacksPage() {
  const supabase = await createClient();
  const { data: packs } = await supabase
    .from("packs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Packs y programas</h1>
      <p className="mb-8 text-[#1a1a1a]/70">
        Desde una sesión individual hasta un proceso de varios encuentros.
      </p>
      {!packs || packs.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay packs publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {packs.map((p) => (
            <ProductCard
              key={p.id}
              href={`/packs/${p.id}`}
              image={p.image_urls?.[0] ?? null}
              title={p.name}
              subtitle={p.sessions_count ? `${p.sessions_count} sesión${p.sessions_count > 1 ? "es" : ""}` : null}
              price={p.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
