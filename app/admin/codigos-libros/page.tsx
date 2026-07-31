import { createClient } from "@/lib/supabase/server";
import BookPromoCodeForm from "@/components/admin/BookPromoCodeForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleBookPromoCodeActive, deleteBookPromoCode } from "@/app/admin/actions";

export default async function AdminCodigosLibrosPage() {
  const supabase = await createClient();

  const [{ data: books }, { data: codes }] = await Promise.all([
    supabase.from("books").select("*").order("title", { ascending: true }),
    supabase
      .from("book_promo_codes")
      .select("*, books(title)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Códigos compartidos de libros</h1>
      <p className="mb-4 text-sm text-gray-500">
        Un mismo código que varias personas distintas pueden canjear, cada una una sola vez. Para
        un código de un solo uso destinado a una sola persona, usá "Generar código gratis" en la
        lista de Libros.
      </p>
      <BookPromoCodeForm books={books ?? []} />

      <ul className="mt-8 flex flex-col gap-2">
        {codes?.map((c) => {
          const book = c.books as unknown as { title: string } | null;
          return (
            <li key={c.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{c.code}</p>
                <p className="text-xs text-gray-500">
                  {book?.title ?? "Libro eliminado"} · {c.is_active ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ToggleActiveButton id={c.id} isActive={c.is_active} action={toggleBookPromoCodeActive} />
                <DeleteButton
                  id={c.id}
                  action={deleteBookPromoCode}
                  confirmMessage={`¿Borrar el código "${c.code}" de forma permanente?`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
