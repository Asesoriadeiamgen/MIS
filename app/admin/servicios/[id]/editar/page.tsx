import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServicioForm from "@/components/admin/ServicioForm";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: servicio } = await supabase.from("servicios").select("*").eq("id", id).single();

  if (!servicio) notFound();

  return (
    <div>
      <Link href="/admin/servicios" className="text-xs underline">
        ← Volver a servicios
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {servicio.name}</h1>
      <ServicioForm servicio={servicio} />
    </div>
  );
}
