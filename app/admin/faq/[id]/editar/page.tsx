import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FaqForm from "@/components/admin/FaqForm";

export default async function EditarFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: faq } = await supabase.from("faqs").select("*").eq("id", id).single();

  if (!faq) notFound();

  return (
    <div>
      <Link href="/admin/faq" className="text-xs underline">
        ← Volver a preguntas frecuentes
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar pregunta</h1>
      <FaqForm faq={faq} />
    </div>
  );
}
