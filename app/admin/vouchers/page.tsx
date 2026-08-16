import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VoucherForm from "@/components/admin/VoucherForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleVoucherActive, deleteVoucher, reorderVouchers } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

export default async function AdminVouchersPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("vouchers").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Vouchers de regalo</h1>
      <VoucherForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div className="flex items-center gap-3">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(item.price)} · {item.is_active ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/vouchers/${item.id}/enviar`} className="text-xs font-medium text-lilac-deep underline">
                  Enviar mail
                </Link>
                <Link href={`/admin/vouchers/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleVoucherActive} />
                <DeleteButton
                  id={item.id}
                  action={deleteVoucher}
                  confirmMessage={`¿Borrar el voucher "${item.name}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderVouchers}
      />
    </div>
  );
}
