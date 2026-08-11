import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VoucherForm from "@/components/admin/VoucherForm";

export default async function EditarVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: voucher } = await supabase.from("vouchers").select("*").eq("id", id).single();
  if (!voucher) notFound();

  return (
    <div>
      <Link href="/admin/vouchers" className="text-xs underline">
        ← Volver a vouchers
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar voucher</h1>
      <VoucherForm voucher={voucher} />
    </div>
  );
}
