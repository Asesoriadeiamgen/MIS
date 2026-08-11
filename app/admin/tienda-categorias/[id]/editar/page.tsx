import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TiendaCategoriaForm from "@/components/admin/TiendaCategoriaForm";

export default async function EditarTiendaCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: categoria } = await supabase.from("tienda_categorias").select("*").eq("id", id).single();
  if (!categoria) notFound();

  return (
    <div>
      <Link href="/admin/tienda-categorias" className="text-xs underline">
        ← Volver a categorías de la Tienda
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar categoría</h1>
      <TiendaCategoriaForm categoria={categoria} />
    </div>
  );
}
