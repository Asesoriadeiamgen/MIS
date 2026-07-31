import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { firstImageUrl } from "@/lib/media";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string | null;
  price: number;
};

function itemXml(item: FeedItem): string {
  if (!item.imageLink) return "";
  return `
  <item>
    <g:id>${escapeXml(item.id)}</g:id>
    <title>${cdata(item.title)}</title>
    <description>${cdata(item.description || item.title)}</description>
    <link>${escapeXml(item.link)}</link>
    <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
    <g:availability>in_stock</g:availability>
    <g:price>${item.price.toFixed(2)} ARS</g:price>
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(SITE_NAME)}</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
  </item>`;
}

export async function GET() {
  const supabase = await createClient();

  const [{ data: agendas }, { data: artesanias }, { data: varios }] = await Promise.all([
    supabase
      .from("agendas")
      .select("*")
      .eq("is_active", true)
      .not("base_price", "is", null),
    supabase
      .from("artesanias")
      .select("*")
      .eq("is_active", true)
      .not("price", "is", null),
    supabase
      .from("varios_products")
      .select("*")
      .eq("is_active", true)
      .not("price", "is", null),
  ]);

  const items: FeedItem[] = [
    ...(agendas ?? []).map((a) => ({
      id: `agenda-${a.id}`,
      title: `Agenda ${a.name} personalizada`,
      description: a.description || "",
      link: `${SITE_URL}/agendas/${a.id}`,
      imageLink: a.cover_url || firstImageUrl(a.image_urls),
      price: a.base_price as number,
    })),
    ...(artesanias ?? []).map((a) => ({
      id: `artesania-${a.id}`,
      title: `${a.name} — Artesanía hecha a mano`,
      description: a.description || "",
      link: `${SITE_URL}/artesanias/${a.id}`,
      imageLink: firstImageUrl(a.image_urls),
      price: a.price as number,
    })),
    ...(varios ?? []).map((v) => ({
      id: `varios-${v.id}`,
      title: v.name,
      description: v.description || "",
      link: `${SITE_URL}/varios/${v.id}`,
      imageLink: v.image_url,
      price: v.price as number,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${escapeXml(SITE_URL)}</link>
  <description>Catálogo de productos de ${escapeXml(SITE_NAME)} para Google Merchant Center</description>
  ${items.map(itemXml).join("")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
