import { createClient } from "@/lib/supabase/server";
import DisponibilidadForm from "@/components/admin/DisponibilidadForm";
import BloqueoForm from "@/components/admin/BloqueoForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  toggleDisponibilidadActive,
  deleteDisponibilidad,
  deleteBloqueo,
  cancelTurno,
} from "@/app/admin/actions";

const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function AdminAgendaPage() {
  const supabase = await createClient();
  const [{ data: disponibilidad }, { data: bloqueos }, { data: turnos }] = await Promise.all([
    supabase.from("disponibilidad_semanal").select("*").order("weekday").order("start_time"),
    supabase.from("bloqueos_fecha").select("*").order("start_at"),
    supabase
      .from("turnos")
      .select("*")
      .eq("status", "confirmado")
      .gte("start_at", new Date().toISOString())
      .order("start_at"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-xl font-semibold">Disponibilidad semanal</h1>
        <DisponibilidadForm />
        <ul className="mt-6 flex flex-col gap-2">
          {disponibilidad?.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-md border p-3">
              <p className="text-sm">
                {WEEKDAY_NAMES[d.weekday]} · {d.start_time.slice(0, 5)} a {d.end_time.slice(0, 5)} ·{" "}
                {d.is_active ? "Activo" : "Inactivo"}
              </p>
              <div className="flex items-center gap-4">
                <ToggleActiveButton id={d.id} isActive={d.is_active} action={toggleDisponibilidadActive} />
                <DeleteButton
                  id={d.id}
                  action={deleteDisponibilidad}
                  confirmMessage="¿Borrar esta franja horaria?"
                />
              </div>
            </li>
          ))}
          {(!disponibilidad || disponibilidad.length === 0) && (
            <p className="text-sm text-gray-500">Todavía no cargaste ninguna franja horaria.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Bloqueos puntuales</h2>
        <BloqueoForm />
        <ul className="mt-6 flex flex-col gap-2">
          {bloqueos?.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-md border p-3">
              <p className="text-sm">
                {new Date(b.start_at).toLocaleString("es-AR")} → {new Date(b.end_at).toLocaleString("es-AR")}
                {b.reason ? ` · ${b.reason}` : ""}
              </p>
              <DeleteButton id={b.id} action={deleteBloqueo} confirmMessage="¿Borrar este bloqueo?" />
            </li>
          ))}
          {(!bloqueos || bloqueos.length === 0) && (
            <p className="text-sm text-gray-500">No hay bloqueos cargados.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Próximos turnos</h2>
        <ul className="flex flex-col gap-2">
          {turnos?.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{new Date(t.start_at).toLocaleString("es-AR")}</p>
                <p className="text-xs text-gray-500">
                  {t.client_name} · {t.client_email}
                  {t.client_phone ? ` · ${t.client_phone}` : ""}
                  {t.servicio_nombre ? ` · ${t.servicio_nombre}` : ""}
                </p>
                {t.notes && <p className="text-xs text-gray-500">Notas: {t.notes}</p>}
              </div>
              <DeleteButton
                id={t.id}
                action={cancelTurno}
                label="Cancelar"
                confirmMessage={`¿Cancelar el turno de ${t.client_name}?`}
              />
            </li>
          ))}
          {(!turnos || turnos.length === 0) && (
            <p className="text-sm text-gray-500">No hay turnos próximos reservados.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
