import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SendVoucherEmailForm from "@/components/admin/SendVoucherEmailForm";
import { formatPrice } from "@/lib/format";

export default async function EnviarVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: voucher } = await supabase.from("vouchers").select("*").eq("id", id).single();
  if (!voucher) notFound();

  return (
    <div>
      <Link href="/admin/vouchers" className="text-xs underline">
        ← Volver a vouchers
      </Link>
      <h1 className="mb-1 mt-2 text-xl font-semibold">Enviar voucher por mail</h1>
      <p className="mb-4 text-sm text-gray-500">
        {voucher.name} · {formatPrice(voucher.price)}
      </p>
      <SendVoucherEmailForm voucherId={voucher.id} />
    </div>
  );
}
