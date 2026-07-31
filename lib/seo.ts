// TODO: personalizar con los datos reales del cliente antes de lanzar.
export const SITE_NAME = "Tu Marca";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tudominio.com.ar";
export const SITE_DESCRIPTION =
  "Catálogo online con carrito de compra, pagos y productos personalizables.";
export const CONTACT_EMAIL = "contacto@tudominio.com";
// Código de país + número, sin "+" ni espacios (ej. Argentina: 549 + código de área sin 0 + número sin 15).
export const WHATSAPP_NUMBER = "5491100000000";
export const INSTAGRAM_ACCOUNTS = [{ href: "https://instagram.com/tumarca", label: "@tumarca" }];

// Diccionario de términos del rubro real de la tienda: se usa para derivar
// etiquetas visibles y palabras clave a partir del título/descripción de cada
// producto, sin depender de un campo manual que haya que cargar a mano.
// Estos son solo ejemplos genéricos — reemplazar por el vocabulario del rubro de cada cliente.
const TAG_DICTIONARY: { pattern: RegExp; tag: string }[] = [
  { pattern: /agenda/i, tag: "Agenda Personalizada" },
  { pattern: /artesan/i, tag: "Artesanía Hecha a Mano" },
  { pattern: /\bpdf\b|digital|descargar/i, tag: "Libro Digital" },
  { pattern: /curso|taller|seminario|capacitaci[oó]n/i, tag: "Curso" },
];

const TYPE_FALLBACK_TAG: Record<string, string> = {
  libro: "Libro Digital",
  agenda: "Agenda Personalizada",
  artesania: "Artesanía Hecha a Mano",
  varios: SITE_NAME,
  curso: "Curso",
};

export function deriveTags(
  productType: keyof typeof TYPE_FALLBACK_TAG,
  ...texts: (string | null | undefined)[]
): string[] {
  const haystack = texts.filter(Boolean).join(" ");
  const tags = TAG_DICTIONARY.filter(({ pattern }) => pattern.test(haystack)).map((t) => t.tag);
  const unique = Array.from(new Set(tags));
  if (unique.length === 0) unique.push(TYPE_FALLBACK_TAG[productType]);
  return unique.slice(0, 6);
}

export function truncateDescription(text: string | null | undefined, max = 155): string {
  if (!text) return SITE_DESCRIPTION;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Arma los bloques openGraph + twitter con los mismos datos, para que las
 * tarjetas de Facebook/WhatsApp y de Twitter/X coincidan (por defecto el
 * twitter card hereda el título/descripción genérico del sitio si no se
 * define acá). Sin `image`, ambos heredan la imagen OG por defecto del sitio
 * (app/opengraph-image.tsx) en vez de forzar una propia.
 */
export function buildSocialMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}) {
  return {
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type: "website" as const,
      locale: "es_AR",
      ...(image ? { images: [{ url: image, width: 1200, height: 1200, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** JSON-LD de BreadcrumbList (Inicio → categoría → producto) para rich snippets. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
