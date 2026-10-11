import type { Metadata } from "next";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import EstiloApp from "@/components/EstiloApp";

const title = "Test de estilo";
const description = `Descubrí tu arquetipo de estilo, tu paleta de colores y los cortes que te favorecen con el test de ${SITE_NAME}.`;
const keywords = ["test de estilo", "arquetipos", "colorimetría", "paleta de color", "asesoría de imagen"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/estilo" },
  ...buildSocialMeta({ title, description, path: "/estilo" }),
};

export default function EstiloPage() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-10 sm:px-4">
      <div className="mx-auto mb-6 max-w-3xl px-2 text-center">
        <h1 className="mb-2 font-serif text-3xl">Test de estilo</h1>
        <p className="text-[#1a1a1a]/70">
          Completá tus datos o hacé el cuestionario de arquetipos y recibí al instante tu informe con
          colores, cortes, combinaciones y armario cápsula. Lo podés guardar en PDF.
        </p>
      </div>
      <EstiloApp />
    </div>
  );
}
