import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArtesaniaForm from "@/components/admin/ArtesaniaForm";

export default async function EditarArtesaniaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artesania } = await supabase.from("artesanias").select("*").eq("id", id).single();

  if (!artesania) notFound();

  return (
    <div>
      <Link href="/admin/artesanias" className="text-xs underline">
        ← Volver a artesanías
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {artesania.name}</h1>
      <ArtesaniaForm artesania={artesania} />
    </div>
  );
}
