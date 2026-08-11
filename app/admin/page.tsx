import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const LINKS = [
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/sobre-mi", label: "Sobre mí" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/formaciones", label: "Formaciones" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/testimonios", label: "Testimonios" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/libros", label: "Ebooks/Guías" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/tienda-categorias", label: "Categorías Tienda" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/codigos-libros", label: "Códigos ebooks" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default async function AdminHomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: turnosProximos }, { count: pedidosPendientes }] = await Promise.all([
    supabase
      .from("turnos")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmado")
      .gte("start_at", now)
      .lte("start_at", in7days),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Panel de administración</h1>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/agenda"
          className="rounded-md border p-4 transition hover:border-black/40"
        >
          <p className="text-3xl font-semibold">{turnosProximos ?? 0}</p>
          <p className="text-sm text-gray-500">Turnos en los próximos 7 días</p>
        </Link>
        <Link
          href="/admin/pedidos"
          className="rounded-md border p-4 transition hover:border-black/40"
        >
          <p className="text-3xl font-semibold">{pedidosPendientes ?? 0}</p>
          <p className="text-sm text-gray-500">Pedidos pendientes de pago</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border p-3 text-center text-sm transition hover:border-black/40"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
