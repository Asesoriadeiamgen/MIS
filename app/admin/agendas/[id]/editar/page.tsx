import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AgendaForm from "@/components/admin/AgendaForm";

export default async function EditarAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: agenda } = await supabase.from("agendas").select("*").eq("id", id).single();

  if (!agenda) notFound();

  return (
    <div>
      <Link href="/admin/agendas" className="text-xs underline">
        ← Volver a agendas
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {agenda.name}</h1>
      <AgendaForm agenda={agenda} />
    </div>
  );
}
