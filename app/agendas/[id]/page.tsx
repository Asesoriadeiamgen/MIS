import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import AgendaCustomizeForm from "@/components/AgendaCustomizeForm";
import ProductTags from "@/components/ProductTags";
import ShippingNote from "@/components/ShippingNote";
import { isVideoUrl } from "@/lib/media";
import { deriveTags, truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: agenda } = await supabase.from("agendas").select("*").eq("id", id).single();
  if (!agenda) return {};

  const title = `Agenda ${agenda.name} personalizada`;
  const description = truncateDescription(agenda.description);
  return {
    title,
    description,
    alternates: { canonical: `/agendas/${id}` },
    ...buildSocialMeta({ title, description, path: `/agendas/${id}`, image: agenda.cover_url }),
  };
}

export default async function AgendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agenda } = await supabase.from("agendas").select("*").eq("id", id).single();
  if (!agenda) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tags = deriveTags("agenda", agenda.name, agenda.description);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: agenda.name,
    description: agenda.description || undefined,
    image: agenda.cover_url || undefined,
    url: `${SITE_URL}/agendas/${id}`,
    offers:
      agenda.base_price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: agenda.base_price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/agendas/${id}`,
          }
        : undefined,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Agendas", path: "/agendas" },
    { name: agenda.name, path: `/agendas/${id}` },
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
          {(agenda.image_urls?.length ? agenda.image_urls : [agenda.cover_url]).map((url, i) => (
            <div key={i} className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
              {url && isVideoUrl(url) ? (
                <video src={url} controls preload="none" className="h-full w-full object-cover" />
              ) : url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${agenda.name} - foto ${i + 1}`} className="h-full w-full object-contain" />
              ) : null}
            </div>
          ))}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{agenda.name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(agenda.base_price)}</p>
          <ShippingNote />
          {agenda.description && <p className="mt-4 text-sm text-gray-700">{agenda.description}</p>}
          <ProductTags tags={tags} />
        </div>
      </div>

      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-medium mb-4">Personalizá tu agenda</h2>
        <AgendaCustomizeForm agenda={agenda} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
