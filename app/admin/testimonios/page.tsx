import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TestimonioForm from "@/components/admin/TestimonioForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleTestimonioActive, deleteTestimonio, reorderTestimonios } from "@/app/admin/actions";

export default async function AdminTestimoniosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("testimonios").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Testimonios</h1>
      <TestimonioForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{item.client_name}</p>
                <p className="text-xs text-gray-500">
                  {item.quote.slice(0, 60)}
                  {item.quote.length > 60 ? "…" : ""} · {item.is_active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/testimonios/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleTestimonioActive} />
                <DeleteButton
                  id={item.id}
                  action={deleteTestimonio}
                  confirmMessage={`¿Borrar el testimonio de "${item.client_name}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderTestimonios}
      />
    </div>
  );
}
