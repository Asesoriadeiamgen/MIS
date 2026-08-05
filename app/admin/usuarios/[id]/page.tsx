import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, formatBirthday } from "@/lib/format";

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
      <h1 className="mb-1 mt-2 text-xl font-semibold">
        {profile.full_name || "Sin nombre"}
        {profile.is_admin && <span className="ml-2 text-xs font-normal text-gray-500">(admin)</span>}
      </h1>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-gray-500">Email</dt>
        <dd>{profile.email}</dd>
        <dt className="text-gray-500">Teléfono</dt>
        <dd>{profile.phone || "—"}</dd>
        <dt className="text-gray-500">DNI</dt>
        <dd>{profile.dni || "—"}</dd>
        <dt className="text-gray-500">Cumpleaños</dt>
        <dd>{formatBirthday(profile.birth_day, profile.birth_month) || "—"}</dd>
        <dt className="text-gray-500">Se registró</dt>
        <dd>{formatDate(profile.created_at)}</dd>
      </dl>

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
