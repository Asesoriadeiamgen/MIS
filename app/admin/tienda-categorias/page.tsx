import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TiendaCategoriaForm from "@/components/admin/TiendaCategoriaForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import {
  toggleTiendaCategoriaActive,
  deleteTiendaCategoria,
  reorderTiendaCategorias,
} from "@/app/admin/actions";

export default async function AdminTiendaCategoriasPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("tienda_categorias")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Categorías de la Tienda</h1>
      <p className="mb-4 text-sm text-gray-500">
        Son los tiles que se muestran arriba de todo en /tienda (Ebooks, Cursos, Formaciones, etc.).
      </p>
      <TiendaCategoriaForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">
                  {item.emoji} {item.title}
                </p>
                <p className="text-xs text-gray-500">
                  {item.href} · {item.is_active ? "Activa" : "Inactiva"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/tienda-categorias/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleTiendaCategoriaActive} />
                <DeleteButton
                  id={item.id}
                  action={deleteTiendaCategoria}
                  confirmMessage={`¿Borrar la categoría "${item.title}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderTiendaCategorias}
      />
    </div>
  );
}
