import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Servicios";
const description = `Servicios de asesoría de imagen de ${SITE_NAME}: colorimetría, guardarropa, personal shopper, imagen ejecutiva y más.`;
const keywords = [
  "asesoría de imagen",
  "colorimetría",
  "personal shopper",
  "imagen ejecutiva",
  "asesoramiento de imagen online",
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/servicios" },
  ...buildSocialMeta({ title, description, path: "/servicios" }),
};

export default async function ServiciosPage() {
  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Servicios</h1>
      <p className="mb-8 text-[#1a1a1a]/70">
        Asesorías individuales, online o presenciales. Consultá disponibilidad y agendá tu turno.
      </p>
      {!servicios || servicios.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay servicios publicados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {servicios.map((s) => (
            <ProductCard
              key={s.id}
              href={`/servicios/${s.id}`}
              image={s.image_urls?.[0] ?? null}
              title={s.name}
              subtitle={s.modalidad === "ambas" ? "Online y presencial" : s.modalidad === "online" ? "Online" : "Presencial"}
              price={s.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
