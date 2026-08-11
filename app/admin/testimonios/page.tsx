import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TestimonioForm from "@/components/admin/TestimonioForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleTestimonioActive, deleteTestimonio, reorderTestimonios } from "@/app/admin/actions";
import { formatMonthYear } from "@/lib/format";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default async function AdminTestimoniosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("testimonios").select("*").order("sort_order", { ascending: true });

  const pending = (items ?? []).filter((item) => !item.is_active);
  const published = (items ?? []).filter((item) => item.is_active);

  function row(item: NonNullable<typeof items>[number]) {
    return {
      id: item.id,
      content: (
        <>
          <div>
            <p className="text-sm font-medium">{item.client_name}</p>
            <p className="text-xs text-gray-500">
              {[item.product_or_service, formatMonthYear(item.purchase_month)].filter(Boolean).join(" · ")}
            </p>
            <p className="text-xs text-gray-500">
              {stripHtml(item.quote).slice(0, 60)}
              {stripHtml(item.quote).length > 60 ? "…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/admin/testimonios/${item.id}/editar`} className="text-xs underline">
              Editar
            </Link>
            <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleTestimonioActive} />
            <DeleteButton
              id={item.id}
              action={deleteTestimonio}
              confirmMessage={`¿Borrar el testimonio de "${item.client_name}" de forma permanente?`}
            />
          </div>
        </>
      ),
    };
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Testimonios</h1>
      <TestimonioForm />

      {pending.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            Pendientes de aprobación ({pending.length})
          </h2>
          <p className="mb-2 text-xs text-gray-500">
            Enviados desde /testimonios/enviar. Activalos para que se muestren en la página pública.
          </p>
          <DraggableList items={pending.map(row)} reorderAction={reorderTestimonios} />
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Publicados ({published.length})
        </h2>
        <DraggableList items={published.map(row)} reorderAction={reorderTestimonios} />
      </div>
    </div>
  );
}
