import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import ProductTags from "@/components/ProductTags";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import ShippingNote from "@/components/ShippingNote";
import { deriveTags, truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("varios_products").select("*").eq("id", id).single();
  if (!item) return {};

  const description = truncateDescription(item.description);
  return {
    title: item.name,
    description,
    alternates: { canonical: `/varios/${id}` },
    ...buildSocialMeta({ title: item.name, description, path: `/varios/${id}`, image: item.image_url }),
  };
}

export default async function VariosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase.from("varios_products").select("*").eq("id", id).single();
  if (!item) notFound();

  const tags = deriveTags("varios", item.name, item.description);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description || undefined,
    image: item.image_url || undefined,
    url: `${SITE_URL}/varios/${id}`,
    offers:
      item.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: item.price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/varios/${id}`,
          }
        : undefined,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Varios", path: "/varios" },
    { name: item.name, path: `/varios/${id}` },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{item.name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(item.price)}</p>
          <ShippingNote />
          {item.description && <p className="mt-4 text-sm text-gray-700">{item.description}</p>}
          <ProductTags tags={tags} />

          <div className="mt-6">
            {item.price !== null ? (
              <AddToCartButton
                productType="varios"
                productId={item.id}
                title={item.name}
                unitPrice={item.price}
                image={item.image_url ?? undefined}
              />
            ) : (
              <WhatsappDeliveryNote
                label="Consultá el precio por WhatsApp."
                message={`Hola! Quiero consultar el precio de "${item.name}".`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
