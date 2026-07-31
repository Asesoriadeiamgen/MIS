import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import ServicioForm from "@/components/admin/ServicioForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleServicioActive, deleteServicio, reorderServicios } from "@/app/admin/actions";

export default async function AdminServiciosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("servicios").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Servicios</h1>
      <ServicioForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.price)} · {item.is_active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/servicios/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleServicioActive} />
                <DeleteButton
                  id={item.id}
                  action={deleteServicio}
                  confirmMessage={`¿Borrar "${item.name}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderServicios}
      />
    </div>
  );
}
