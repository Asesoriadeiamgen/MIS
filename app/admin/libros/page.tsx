import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import BookForm from "@/components/admin/BookForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import GenerateBookCodeButton from "@/components/admin/GenerateBookCodeButton";
import DraggableList from "@/components/admin/DraggableList";
import { toggleBookActive, deleteBook, reorderBooks } from "@/app/admin/actions";

export default async function AdminLibrosPage() {
  const supabase = await createClient();
  const { data: books } = await supabase.from("books").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Libros</h1>
      <BookForm />

      <DraggableList
        items={(books ?? []).map((book) => ({
          id: book.id,
          content: (
            <>
              <div>
                <p className="text-sm font-medium">{book.title}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(book.price)} · {book.is_active ? "Activo" : "Inactivo"}
                  {!book.file_path && " · sin archivo"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <GenerateBookCodeButton bookId={book.id} />
                <Link href={`/admin/libros/${book.id}/editar`} className="text-xs underline">
                  Editar
                </Link>
                <ToggleActiveButton id={book.id} isActive={book.is_active} action={toggleBookActive} />
                <DeleteButton
                  id={book.id}
                  action={deleteBook}
                  confirmMessage={`¿Borrar "${book.title}" de forma permanente?`}
                />
              </div>
            </>
          ),
        }))}
        reorderAction={reorderBooks}
      />
    </div>
  );
}
