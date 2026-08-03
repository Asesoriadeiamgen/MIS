import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const title = "Portfolio";
const description = `Antes y después de clientas de ${SITE_NAME}.`;
const keywords = ["antes y después asesoría de imagen", "transformación de imagen", "portfolio asesora de imagen"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/portfolio" },
  ...buildSocialMeta({ title, description, path: "/portfolio" }),
};

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Portfolio</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Antes y después de clientas reales.</p>

      {!items || items.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay casos publicados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-sm border border-black/10 bg-white">
              {item.before_image_url && item.after_image_url ? (
                <div className="grid grid-cols-2">
                  <div className="aspect-[3/4] overflow-hidden bg-soft-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.before_image_url} alt="Antes" className="h-full w-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] overflow-hidden bg-soft-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.after_image_url} alt="Después" className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : item.image_url ? (
                <div className="aspect-[4/3] overflow-hidden bg-soft-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title ?? ""} className="h-full w-full object-cover" />
                </div>
              ) : null}
              {(item.title || item.description) && (
                <div className="p-4">
                  {item.title && <h2 className="font-serif text-lg">{item.title}</h2>}
                  {item.description && (
                    <div
                      className="prose prose-sm mt-1 max-w-none text-sm text-[#1a1a1a]/70 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
