import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import AgendaForm from "@/components/admin/AgendaForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleAgendaActive, deleteAgenda, reorderAgendas } from "@/app/admin/actions";

export default async function AdminAgendasPage() {
  const supabase = await createClient();
  const { data: agendas } = await supabase
    .from("agendas")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Agendas</h1>
      <AgendaForm />

      <DraggableList
        items={(agendas ?? []).map((agenda) => ({
          id: agenda.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{agenda.name}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(agenda.base_price)} · {agenda.is_active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/agendas/${agenda.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={agenda.id} isActive={agenda.is_active} action={toggleAgendaActive} />
                <DeleteButton
                  id={agenda.id}
                  action={deleteAgenda}
                  confirmMessage={`¿Borrar "${agenda.name}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderAgendas}
      />
    </div>
  );
}
