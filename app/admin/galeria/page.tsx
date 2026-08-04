import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GaleriaFotoForm from "@/components/admin/GaleriaFotoForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleGaleriaFotoActive, deleteGaleriaFoto, reorderGaleriaFotos } from "@/app/admin/actions";

export default async function AdminGaleriaPage() {
  const supabase = await createClient();
  const { data: fotos } = await supabase
    .from("galeria_fotos")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = Array.from(new Set((fotos ?? []).map((f) => f.category))).sort();

  const byCategory = new Map<string, typeof fotos>();
  for (const foto of fotos ?? []) {
    const list = byCategory.get(foto.category) ?? [];
    list.push(foto);
    byCategory.set(foto.category, list);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Galería</h1>
      <GaleriaFotoForm categories={categories} />

      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">Todavía no hay fotos cargadas.</p>
      ) : (
        categories.map((category) => (
          <div key={category} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">{category}</h2>
            <DraggableList
              items={(byCategory.get(category) ?? []).map((item) => ({
                id: item.id,
                content: (
                  <>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                      <div>
                        <p className="text-sm">{item.caption || <span className="text-gray-400">Sin descripción</span>}</p>
                        <p className="text-xs text-gray-500">{item.is_active ? "Activa" : "Inactiva"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/galeria/${item.id}/editar`} className="text-xs underline">
                        Editar
                      </Link>
                      <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleGaleriaFotoActive} />
                      <DeleteButton
                        id={item.id}
                        action={deleteGaleriaFoto}
                        confirmMessage="¿Borrar esta foto de forma permanente?"
                      />
                    </div>
                  </>
                ),
              }))}
              reorderAction={reorderGaleriaFotos}
            />
          </div>
        ))
      )}
    </div>
  );
}
