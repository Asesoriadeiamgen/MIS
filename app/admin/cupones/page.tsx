import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import DiscountCodeForm from "@/components/admin/DiscountCodeForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleDiscountCodeActive, deleteDiscountCode } from "@/app/admin/actions";

export default async function AdminCuponesPage() {
  const supabase = await createClient();
  const { data: codes } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Cupones de descuento</h1>
      <DiscountCodeForm />

      <ul className="mt-8 flex flex-col gap-2">
        {codes?.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{c.code}</p>
              <p className="text-xs text-gray-500">
                {c.percent_off != null ? `${c.percent_off}% off` : `${formatPrice(c.amount_off!)} off`} ·{" "}
                {c.is_active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ToggleActiveButton id={c.id} isActive={c.is_active} action={toggleDiscountCodeActive} />
              <DeleteButton
                id={c.id}
                action={deleteDiscountCode}
                confirmMessage={`¿Borrar el cupón "${c.code}" de forma permanente?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
