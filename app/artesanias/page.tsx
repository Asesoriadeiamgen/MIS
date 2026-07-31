import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { firstImageUrl } from "@/lib/media";
import { buildSocialMeta } from "@/lib/seo";

const title = "Artesanías hechas a mano y personalizables";
const description =
  "Piezas artesanales hechas a mano, personalizables antes de comprar. Coordinamos el envío y tiempo de entrega por WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/artesanias" },
  ...buildSocialMeta({ title, description, path: "/artesanias" }),
};

export default async function ArtesaniasPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("artesanias")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Artesanías</h1>
      <p className="mb-8 text-[#2b2622]/70">Piezas hechas a mano, personalizables antes de comprar.</p>
      {!items || items.length === 0 ? (
        <p className="text-sm text-[#2b2622]/50">Todavía no hay productos publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              href={`/artesanias/${item.id}`}
              image={firstImageUrl(item.image_urls)}
              title={item.name}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
