import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default async function EditarPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("portfolio").select("*").eq("id", id).single();

  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/portfolio" className="text-xs underline">
        ← Volver a portfolio
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {item.title || "portfolio"}</h1>
      <PortfolioForm item={item} />
    </div>
  );
}
