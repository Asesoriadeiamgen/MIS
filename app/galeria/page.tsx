import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GaleriaCarousel from "@/components/GaleriaCarousel";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Galería";
const description = `Fotos de trabajos de ${SITE_NAME}, organizadas por tipo de asesoría.`;
const keywords = ["galería de fotos", "asesoría de imagen", "trabajos realizados"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/galeria" },
  ...buildSocialMeta({ title, description, path: "/galeria" }),
};

export default async function GaleriaPage() {
  const supabase = await createClient();
  const { data: fotos } = await supabase
    .from("galeria_fotos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = Array.from(new Set((fotos ?? []).map((f) => f.category)));
  const photosByCategory: Record<string, { id: string; image_url: string; caption: string | null }[]> = {};
  for (const foto of fotos ?? []) {
    (photosByCategory[foto.category] ??= []).push({
      id: foto.id,
      image_url: foto.image_url,
      caption: foto.caption,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-center font-serif text-3xl">Galería</h1>

      {categories.length === 0 ? (
        <p className="text-center text-sm text-[#1a1a1a]/50">Todavía no hay fotos publicadas.</p>
      ) : (
        <GaleriaCarousel categories={categories} photosByCategory={photosByCategory} />
      )}
    </div>
  );
}
