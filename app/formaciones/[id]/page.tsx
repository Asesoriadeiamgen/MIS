import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDuration } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { IconFormacion } from "@/components/icons";
import { truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { LABEL } from "@/lib/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pack } = await supabase.from("packs").select("*").eq("id", id).single();
  if (!pack) return {};

  const description = truncateDescription(pack.description?.replace(/<[^>]+>/g, " "));
  return {
    title: pack.name,
    description,
    alternates: { canonical: `/formaciones/${id}` },
    ...buildSocialMeta({
      title: pack.name,
      description,
      path: `/formaciones/${id}`,
      image: pack.image_urls?.[0],
    }),
  };
}

export default async function PackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pack } = await supabase.from("packs").select("*").eq("id", id).single();
  if (!pack) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pack.name,
    description: pack.description?.replace(/<[^>]+>/g, " ") || undefined,
    image: pack.image_urls?.[0] || undefined,
    url: `${SITE_URL}/formaciones/${id}`,
    offers:
      pack.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: pack.price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/formaciones/${id}`,
          }
        : undefined,
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Formaciones", path: "/formaciones" },
    { name: pack.name, path: `/formaciones/${id}` },
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
          {(pack.image_urls?.length ? pack.image_urls : [null]).map((url, i) => (
            <div key={i} className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-sm bg-soft-bg">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${pack.name} - foto ${i + 1}`} className="h-full w-full object-contain" />
              ) : (
                <IconFormacion className="h-12 w-12 text-lilac-deep" />
              )}
            </div>
          ))}
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <IconFormacion className="h-5 w-5 flex-shrink-0 text-lilac-deep" />
            {pack.name}
          </h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(pack.price)}</p>

          {formatDuration(pack.sessions_count, pack.duration_unit) && (
            <p className="mt-3 text-sm text-[#1a1a1a]/70">
              <span className={LABEL}>Duración: </span>
              {formatDuration(pack.sessions_count, pack.duration_unit)}
            </p>
          )}

          {pack.description && (
            <div
              className="prose prose-sm mt-4 max-w-none text-sm text-[#1a1a1a]/70 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(pack.description) }}
            />
          )}

          <div className="mt-6">
            <WhatsappDeliveryNote
              label={
                pack.price !== null
                  ? "Consultá por WhatsApp antes de comprar."
                  : "Consultá el precio por WhatsApp."
              }
              message={`Hola! Quiero consultar sobre el programa de formación "${pack.name}".`}
            />
          </div>

          {pack.price !== null && (
            <div className="mt-6">
              <AddToCartButton
                productType="pack"
                productId={pack.id}
                title={pack.name}
                unitPrice={pack.price}
                image={pack.image_urls?.[0] ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
