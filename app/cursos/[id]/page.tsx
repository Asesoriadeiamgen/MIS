import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, formatTime } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { truncateDescription, buildSocialMeta, breadcrumbJsonLd, deriveTags, SITE_URL } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { LABEL } from "@/lib/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: curso } = await supabase.from("cursos").select("*").eq("id", id).single();
  if (!curso) return {};

  const description = truncateDescription(curso.description?.replace(/<[^>]+>/g, " "));
  const keywords = [
    curso.name,
    ...deriveTags("curso", curso.name, curso.description),
    "curso de asesoría de imagen",
  ];
  return {
    title: curso.name,
    description,
    keywords,
    alternates: { canonical: `/cursos/${id}` },
    ...buildSocialMeta({
      title: curso.name,
      description,
      path: `/cursos/${id}`,
      image: curso.image_urls?.[0],
    }),
  };
}

export default async function CursoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: curso } = await supabase.from("cursos").select("*").eq("id", id).single();
  if (!curso) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: curso.name,
    description: curso.description?.replace(/<[^>]+>/g, " ") || undefined,
    image: curso.image_urls?.[0] || undefined,
    url: `${SITE_URL}/cursos/${id}`,
    offers:
      curso.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: curso.price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/cursos/${id}`,
          }
        : undefined,
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Cursos", path: "/cursos" },
    { name: curso.name, path: `/cursos/${id}` },
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
          {(curso.image_urls?.length ? curso.image_urls : [null]).map((url, i) => (
            <div key={i} className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${curso.name} - foto ${i + 1}`} className="h-full w-full object-contain" />
              ) : null}
            </div>
          ))}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{curso.name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(curso.price)}</p>

          <div className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
            {curso.start_date && (
              <p>
                <span className={LABEL}>Comienza: </span>
                {formatDate(curso.start_date)}
                {curso.start_time && ` a las ${formatTime(curso.start_time)}`}
              </p>
            )}
            {curso.duration && (
              <p>
                <span className={LABEL}>Duración: </span>
                {curso.duration}
              </p>
            )}
          </div>

          {curso.description && (
            <div
              className="prose prose-sm mt-4 max-w-none text-sm text-gray-700 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(curso.description) }}
            />
          )}

          <div className="mt-6">
            <WhatsappDeliveryNote
              label={
                curso.price !== null
                  ? "Consultá por WhatsApp antes de anotarte."
                  : "Consultá el precio y anotate por WhatsApp."
              }
              message={`Hola! Quiero consultar sobre el curso "${curso.name}".`}
            />
          </div>

          {curso.price !== null && (
            <div className="mt-6">
              <AddToCartButton
                productType="curso"
                productId={curso.id}
                title={curso.name}
                unitPrice={curso.price}
                image={curso.image_urls?.[0] ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
