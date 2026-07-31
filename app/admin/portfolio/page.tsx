import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortfolioForm from "@/components/admin/PortfolioForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { togglePortfolioActive, deletePortfolioItem, reorderPortfolio } from "@/app/admin/actions";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("portfolio").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Portfolio</h1>
      <PortfolioForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{item.title || "(sin título)"}</p>
                <p className="text-xs text-gray-500">{item.is_active ? "Activo" : "Inactivo"}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/portfolio/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={togglePortfolioActive} />
                <DeleteButton
                  id={item.id}
                  action={deletePortfolioItem}
                  confirmMessage="¿Borrar este caso del portfolio de forma permanente?"
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderPortfolio}
      />
    </div>
  );
}
