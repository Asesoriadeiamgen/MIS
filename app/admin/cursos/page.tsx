import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, formatTime } from "@/lib/format";
import CursoForm from "@/components/admin/CursoForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleCursoActive, deleteCurso } from "@/app/admin/actions";

export default async function AdminCursosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("cursos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Cursos</h1>
      <CursoForm />

      <ul className="mt-8 flex flex-col gap-2">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {formatPrice(item.price)}
                {item.duration ? ` · ${item.duration}` : ""}
                {item.start_date
                  ? ` · Comienza ${formatDate(item.start_date)}${item.start_time ? ` ${formatTime(item.start_time)}hs` : ""}`
                  : ""}{" "}
                ·{" "}
                {item.is_active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/admin/cursos/${item.id}/editar`} className="text-xs underline">
                Editar
              </Link>
              <ToggleActiveButton id={item.id} isActive={item.is_active} action={toggleCursoActive} />
              <DeleteButton
                id={item.id}
                action={deleteCurso}
                confirmMessage={`¿Borrar "${item.name}" de forma permanente?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
