import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LINKS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/sobre-mi", label: "Sobre mí" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/formaciones", label: "Formaciones" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/testimonios", label: "Testimonios" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/libros", label: "Ebooks/Guías" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/codigos-libros", label: "Códigos ebooks" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/cuenta/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap gap-4 border-b pb-4">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm font-medium">
            {l.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
