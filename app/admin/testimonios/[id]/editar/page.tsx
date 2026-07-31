import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TestimonioForm from "@/components/admin/TestimonioForm";

export default async function EditarTestimonioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: testimonio } = await supabase.from("testimonios").select("*").eq("id", id).single();

  if (!testimonio) notFound();

  return (
    <div>
      <Link href="/admin/testimonios" className="text-xs underline">
        ← Volver a testimonios
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {testimonio.client_name}</h1>
      <TestimonioForm testimonio={testimonio} />
    </div>
  );
}
