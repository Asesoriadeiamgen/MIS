import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CursoForm from "@/components/admin/CursoForm";

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: curso } = await supabase.from("cursos").select("*").eq("id", id).single();

  if (!curso) notFound();

  return (
    <div>
      <Link href="/admin/cursos" className="text-xs underline">
        ← Volver a cursos
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {curso.name}</h1>
      <CursoForm curso={curso} />
    </div>
  );
}
