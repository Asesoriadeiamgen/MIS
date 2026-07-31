import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import ArtesaniaCustomizeForm from "@/components/ArtesaniaCustomizeForm";
import ProductTags from "@/components/ProductTags";
import ShippingNote from "@/components/ShippingNote";
import { deriveTags, truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { isVideoUrl, firstImageUrl } from "@/lib/media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artesania } = await supabase.from("artesanias").select("*").eq("id", id).single();
  if (!artesania) return {};

  const title = `${artesania.name} — Artesanía hecha a mano`;
  const description = truncateDescription(artesania.description);
  return {
    title,
    description,
    alternates: { canonical: `/artesanias/${id}` },
    ...buildSocialMeta({
      title,
      description,
      path: `/artesanias/${id}`,
      image: firstImageUrl(artesania.image_urls),
    }),
  };
}

export default async function ArtesaniaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: artesania } = await supabase.from("artesanias").select("*").eq("id", id).single();
  if (!artesania) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tags = deriveTags("artesania", artesania.name, artesania.description);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artesania.name,
    description: artesania.description || undefined,
    image: firstImageUrl(artesania.image_urls) || undefined,
    url: `${SITE_URL}/artesanias/${id}`,
    offers:
      artesania.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: artesania.price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/artesanias/${id}`,
          }
        : undefined,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Artesanías", path: "/artesanias" },
    { name: artesania.name, path: `/artesanias/${id}` },
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
        <div className="grid grid-cols-2 gap-2">
          {(artesania.image_urls?.length ? artesania.image_urls : [null]).map((url, i) => (
            <div key={i} className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
              {url && isVideoUrl(url) ? (
                <video src={url} controls preload="none" className="h-full w-full object-cover" />
              ) : url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${artesania.name} - foto ${i + 1}`} className="h-full w-full object-contain" />
              ) : null}
            </div>
          ))}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{artesania.name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(artesania.price)}</p>
          <ShippingNote />
          {artesania.description && (
            <p className="mt-4 text-sm text-gray-700">{artesania.description}</p>
          )}
          <ProductTags tags={tags} />
        </div>
      </div>

      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-medium mb-4">Personalizá tu pieza</h2>
        <ArtesaniaCustomizeForm artesania={artesania} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
