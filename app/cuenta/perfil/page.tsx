import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { signOut, updateProfile } from "@/app/cuenta/actions";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { BUTTON_OUTLINE, INPUT, LABEL } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; emailPending?: string; error?: string }>;
}) {
  const { updated, emailPending, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/cuenta/login?next=/cuenta/perfil");

  const [{ data: profile }, { data: orders }, { data: accesses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("book_access")
      .select("*, books(title, cover_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Mi cuenta</h1>
        <form action={signOut}>
          <button type="submit" className="text-xs uppercase tracking-widest text-[#1a1a1a]/60 underline">
            Cerrar sesión
          </button>
        </form>
      </div>

      <section className="mb-10">
        <h2 className={`mb-2 ${LABEL}`}>Datos personales</h2>

        {updated && <p className="mb-3 text-sm text-green-700">Tus datos se actualizaron.</p>}
        {emailPending && (
          <p className="mb-3 text-sm text-green-700">
            Te enviamos un mail para confirmar tu nuevo correo. Hasta que lo confirmes, seguís
            ingresando con el actual.
          </p>
        )}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <form action={updateProfile} className="flex max-w-sm flex-col gap-4">
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="full_name">
              Nombre
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={profile?.email}
              className={INPUT}
            />
          </div>
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="phone">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ""}
              className={INPUT}
            />
          </div>
          <button type="submit" className={`self-start ${BUTTON_OUTLINE}`}>
            Guardar cambios
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className={`mb-3 ${LABEL}`}>Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>

      <section className="mb-10">
        <h2 className={`mb-3 ${LABEL}`}>Mis libros</h2>
        {!accesses || accesses.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/50">Todavía no tenés libros desbloqueados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {accesses.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-sm border border-black/12 p-3"
              >
                <span className="text-sm font-medium">
                  {(a.books as unknown as { title: string } | null)?.title || "Libro"}
                </span>
                <Link href={`/libros/${a.book_id}/leer`} className="text-sm underline">
                  Leer
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className={`mb-3 ${LABEL}`}>Mis pedidos</h2>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-[#1a1a1a]/50">Todavía no hiciste ningún pedido.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-sm border border-black/12 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Pedido #{order.id.slice(0, 8)}</span>
                  <span className="capitalize">{order.status}</span>
                </div>
                <p className="text-sm text-[#1a1a1a]/70">{formatPrice(order.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
