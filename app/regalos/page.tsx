import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildSocialMeta, SITE_NAME, WHATSAPP_NUMBER } from "@/lib/seo";
import { formatPrice } from "@/lib/format";
import { IconWhatsapp } from "@/components/icons";

const title = "Vouchers de regalo";
const description = `Vouchers de regalo de ${SITE_NAME}, para regalar una asesoría de imagen.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/regalos" },
  ...buildSocialMeta({ title, description, path: "/regalos" }),
};

export default async function RegalosPage() {
  const supabase = await createClient();
  const { data: vouchers } = await supabase
    .from("vouchers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center">
      <h1 className="mb-2 font-serif text-3xl">Vouchers de regalo</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Regalá una asesoría de imagen. La compra se coordina por WhatsApp.</p>

      {!vouchers || vouchers.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay vouchers publicados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {vouchers.map((v) => {
            const waText = `Hola! Quiero comprar el voucher de regalo "${v.name}".`;
            const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

            return (
              <div
                key={v.id}
                className="flex flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-sm"
              >
                {v.image_url && (
                  <div className="h-40 w-full bg-soft-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.image_url} alt="" className="h-full w-full object-contain" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-serif text-lg">{v.name}</h2>
                  {v.description && <p className="mt-1 text-xs text-[#1a1a1a]/60">{v.description}</p>}
                  <p className="mt-2 text-sm font-semibold">{formatPrice(v.price)}</p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-4 py-2 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#20bd5a]"
                  >
                    <IconWhatsapp className="h-4 w-4" />
                    Comprar por WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
