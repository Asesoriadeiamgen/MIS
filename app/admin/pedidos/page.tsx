import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

const CUSTOMIZATION_LABELS: Record<string, string> = {
  color1: "Color 1",
  color2: "Color 2",
  quiereFrases: "¿Frases?",
  tipoFrase: "Tipo de frase",
  hojaEspecial: "Hoja/formulario especial",
  notas: "Notas",
};

type OrderItemRow = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  product_type: string;
  customization: Record<string, unknown> | null;
};

export default async function AdminPedidosPage() {
  const supabase = await createClient();

  const [{ data: orders }, { data: accesses }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*), profiles(email)")
      .order("created_at", { ascending: false }),
    supabase
      .from("book_access")
      .select("*, books(title)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const ordersResolved = await Promise.all(
    (orders ?? []).map(async (order) => {
      const items = (order.order_items as unknown as OrderItemRow[]) || [];
      const itemsResolved = await Promise.all(
        items.map(async (item) => {
          const customization = item.customization || {};
          const fotos = Array.isArray(customization.fotos) ? (customization.fotos as unknown[]) : [];
          let photoUrls: string[] = [];
          if (fotos.length > 0) {
            const bucket = item.product_type === "agenda" ? "agenda-photos" : "artesania-photos";
            const results = await Promise.all(
              fotos
                .filter((p): p is string => typeof p === "string")
                .map((path) => supabase.storage.from(bucket).createSignedUrl(path, 60 * 60))
            );
            photoUrls = results.map((r) => r.data?.signedUrl).filter((u): u is string => !!u);
          }
          const fields = Object.entries(customization).filter(
            ([key, value]) => key !== "fotos" && value !== null && value !== undefined && value !== ""
          );
          return { ...item, photoUrls, fields };
        })
      );
      return { ...order, itemsResolved };
    })
  );

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Pedidos</h1>
      <ul className="flex flex-col gap-3">
        {ordersResolved.map((order) => {
          const profile = order.profiles as unknown as { email: string } | null;
          return (
            <li key={order.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  #{order.id.slice(0, 8)} — {profile?.email}
                </span>
                <span className="capitalize">{order.status}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{formatPrice(order.total)}</p>

              <ul className="mt-2 flex flex-col gap-2">
                {order.itemsResolved.map((item) => (
                  <li key={item.id} className="rounded border-l-2 border-gray-200 pl-3 text-xs">
                    <p className="font-medium text-sm">
                      {item.title} × {item.quantity}
                      <span className="ml-2 text-gray-500">{formatPrice(item.unit_price)}</span>
                    </p>
                    {item.fields.length > 0 && (
                      <table className="mt-1">
                        <tbody>
                          {item.fields.map(([key, value]) => (
                            <tr key={key}>
                              <td className="pr-3 text-gray-500">{CUSTOMIZATION_LABELS[key] || key}</td>
                              <td>
                                {typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {item.photoUrls.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.photoUrls.map((url, i) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Foto {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <h2 className="text-lg font-semibold mt-10 mb-4">Códigos de libros generados</h2>
      <ul className="flex flex-col gap-2">
        {accesses?.map((a) => {
          const book = a.books as unknown as { title: string } | null;
          return (
            <li key={a.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>{book?.title}</span>
              <span className="font-mono">{a.code}</span>
              <span className="text-xs text-gray-500">{a.email_sent_to || "sin asignar"}</span>
              <span className="text-xs">{a.redeemed_at ? "Canjeado" : "Sin canjear"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
