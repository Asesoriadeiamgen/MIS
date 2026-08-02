import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import PackForm from "@/components/admin/PackForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { togglePackActive, deletePack, reorderPacks } from "@/app/admin/actions";

export default async function AdminPacksPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("packs").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Formación</h1>
      <PackForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.price)}
                  {item.sessions_count ? ` · ${item.sessions_count} sesiones` : ""} ·{" "}
                  {item.is_active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/packs/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={togglePackActive} />
                <DeleteButton
                  id={item.id}
                  action={deletePack}
                  confirmMessage={`¿Borrar "${item.name}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderPacks}
      />
    </div>
  );
}
