import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import ToggleAdminButton from "@/components/admin/ToggleAdminButton";
import { toggleUserAdmin } from "@/app/admin/actions";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: orders }, { data: auth }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, status, total"),
    supabase.auth.getUser(),
  ]);
  const currentUserId = auth.user?.id;

  const ordersByUser = new Map<string, { count: number; total: number }>();
  for (const o of orders ?? []) {
    if (o.status !== "paid") continue;
    const entry = ordersByUser.get(o.user_id) || { count: 0, total: 0 };
    entry.count += 1;
    entry.total += o.total;
    ordersByUser.set(o.user_id, entry);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Usuarios</h1>
      <ul className="flex flex-col gap-2">
        {profiles?.map((p) => {
          const stats = ordersByUser.get(p.id);
          return (
            <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">
                  {p.full_name || "Sin nombre"}
                  {p.is_admin && <span className="ml-1 text-xs text-gray-500">(admin)</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {p.email} · {p.phone || "sin teléfono"}
                  {p.birth_day && p.birth_month ? ` · ${p.birth_day} de ${MESES[p.birth_month - 1]}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {stats ? `${stats.count} compra(s) · ${formatPrice(stats.total)}` : "Sin compras"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ToggleAdminButton
                  id={p.id}
                  isAdmin={p.is_admin}
                  disabled={p.id === currentUserId}
                  action={toggleUserAdmin}
                />
                <Link href={`/admin/usuarios/${p.id}`} className="text-xs underline">
                  Ver compras
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
