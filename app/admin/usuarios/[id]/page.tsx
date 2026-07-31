import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

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

export default async function AdminUsuarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div>
      <Link href="/admin/usuarios" className="text-xs underline">
        ← Volver a usuarios
      </Link>
      <h1 className="mb-1 mt-2 text-xl font-semibold">{profile.full_name || "Sin nombre"}</h1>
      <p className="text-sm text-gray-600">{profile.email}</p>
      <p className="text-sm text-gray-600">Teléfono: {profile.phone || "—"}</p>
      <p className="text-sm text-gray-600">
        Cumpleaños:{" "}
        {profile.birth_day && profile.birth_month
          ? `${profile.birth_day} de ${MESES[profile.birth_month - 1]}`
          : "—"}
      </p>

      <h2 className="mb-3 mt-8 text-lg font-medium">Compras</h2>
      <ul className="flex flex-col gap-3">
        {orders?.length ? (
          orders.map((order) => {
            const items = (order.order_items as unknown as { title: string; quantity: number }[]) || [];
            return (
              <li key={order.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">#{order.id.slice(0, 8)}</span>
                  <span className="capitalize">{order.status}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {items.map((i) => `${i.title} x${i.quantity}`).join(", ")}
                </p>
                <p className="mt-1 text-sm font-semibold">{formatPrice(order.total)}</p>
              </li>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">Todavía no hizo compras.</p>
        )}
      </ul>
    </div>
  );
}
