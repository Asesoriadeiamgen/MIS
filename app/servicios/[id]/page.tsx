import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import ProductTags from "@/components/ProductTags";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { deriveTags, truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { BUTTON_PRIMARY, LABEL } from "@/lib/ui";

const MODALIDAD_LABEL: Record<string, string> = {
  online: "Online",
  presencial: "Presencial",
  ambas: "Online y presencial",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: servicio } = await supabase.from("servicios").select("*").eq("id", id).single();
  if (!servicio) return {};

  const description = truncateDescription(servicio.description);
  return {
    title: servicio.name,
    description,
    alternates: { canonical: `/servicios/${id}` },
    ...buildSocialMeta({
      title: servicio.name,
      description,
      path: `/servicios/${id}`,
      image: servicio.image_urls?.[0],
    }),
  };
}

export default async function ServicioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: servicio } = await supabase.from("servicios").select("*").eq("id", id).single();
  if (!servicio) notFound();

  const tags = deriveTags("varios", servicio.name, servicio.description);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: servicio.name,
    description: servicio.description || undefined,
    image: servicio.image_urls?.[0] || undefined,
    url: `${SITE_URL}/servicios/${id}`,
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Servicios", path: "/servicios" },
    { name: servicio.name, path: `/servicios/${id}` },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {(servicio.image_urls?.length ? servicio.image_urls : [null]).map((url, i) => (
            <div key={i} className="aspect-[4/5] overflow-hidden rounded-sm bg-lilac/10">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${servicio.name} - foto ${i + 1}`} className="h-full w-full object-cover" />
              ) : null}
            </div>
          ))}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{servicio.name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(servicio.price)}</p>

          <p className="mt-3 text-sm text-[#1a1a1a]/70">
            <span className={LABEL}>Modalidad: </span>
            {MODALIDAD_LABEL[servicio.modalidad]}
          </p>

          {servicio.description && (
            <p className="mt-4 text-sm text-[#1a1a1a]/70">{servicio.description}</p>
          )}
          <ProductTags tags={tags} />

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/agenda" className={BUTTON_PRIMARY}>
              Agendá tu consulta
            </Link>
            <WhatsappDeliveryNote
              label="¿Tenés dudas? Consultá por WhatsApp."
              message={`Hola! Quiero consultar sobre el servicio "${servicio.name}".`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
