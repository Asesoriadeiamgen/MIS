import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VariosForm from "@/components/admin/VariosForm";

export default async function EditarVariosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("varios_products").select("*").eq("id", id).single();

  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/varios" className="text-xs underline">
        ← Volver a varios
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {item.name}</h1>
      <VariosForm item={item} />
    </div>
  );
}
