import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PackForm from "@/components/admin/PackForm";

export default async function EditarPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pack } = await supabase.from("packs").select("*").eq("id", id).single();

  if (!pack) notFound();

  return (
    <div>
      <Link href="/admin/packs" className="text-xs underline">
        ← Volver a packs
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {pack.name}</h1>
      <PackForm pack={pack} />
    </div>
  );
}
