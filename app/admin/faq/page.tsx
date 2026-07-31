import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FaqForm from "@/components/admin/FaqForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleFaqActive, deleteFaq, reorderFaqs } from "@/app/admin/actions";

export default async function AdminFaqPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Preguntas frecuentes</h1>
      <FaqForm />

      <DraggableList
        items={(items ?? []).map((item) => ({
          id: item.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{item.question}</p>
                <p className="text-xs text-gray-500">{item.is_active ? "Activo" : "Inactivo"}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/faq/${item.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleFaqActive} />
                <DeleteButton
                  id={item.id}
                  action={deleteFaq}
                  confirmMessage="¿Borrar esta pregunta de forma permanente?"
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderFaqs}
      />
    </div>
  );
}
