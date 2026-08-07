import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GaleriaFotoForm from "@/components/admin/GaleriaFotoForm";

export default async function EditarGaleriaFotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: foto } = await supabase.from("galeria_fotos").select("*").eq("id", id).single();
  if (!foto) notFound();

  const { data: fotos } = await supabase.from("galeria_fotos").select("category, subcategory");
  const categories = Array.from(new Set((fotos ?? []).map((f) => f.category))).sort();
  const subcategories = Array.from(
    new Set((fotos ?? []).map((f) => f.subcategory).filter((s): s is string => !!s))
  ).sort();

  return (
    <div>
      <Link href="/admin/galeria" className="text-xs underline">
        ← Volver a galería
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar foto</h1>
      <GaleriaFotoForm foto={foto} categories={categories} subcategories={subcategories} />
    </div>
  );
}
