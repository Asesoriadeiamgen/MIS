import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = `Otros productos de ${SITE_NAME}`;
const description = `Otros productos de ${SITE_NAME}: libros, agendas y artesanías con tu toque personal.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/varios" },
  ...buildSocialMeta({ title, description, path: "/varios" }),
};

export default async function VariosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("varios_products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Varios</h1>
      <p className="mb-8 text-[#2b2622]/70">Otros productos de la tienda.</p>
      {!items || items.length === 0 ? (
        <p className="text-sm text-[#2b2622]/50">Todavía no hay productos publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              href={`/varios/${item.id}`}
              image={item.image_url}
              title={item.name}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
