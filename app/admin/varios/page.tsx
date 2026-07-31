import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import VariosForm from "@/components/admin/VariosForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleVariosActive, deleteVariosProduct } from "@/app/admin/actions";

export default async function AdminVariosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("varios_products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Varios</h1>
      <VariosForm />

      <ul className="mt-8 flex flex-col gap-2">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {formatPrice(item.price)} · {item.is_active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/admin/varios/${item.id}/editar`} className="text-xs underline">
                Editar
              </Link>
              <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleVariosActive} />
              <DeleteButton
                id={item.id}
                action={deleteVariosProduct}
                confirmMessage={`¿Borrar "${item.name}" de forma permanente?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
