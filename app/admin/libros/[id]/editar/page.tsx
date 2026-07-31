import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookForm from "@/components/admin/BookForm";

export default async function EditarLibroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();

  if (!book) notFound();

  return (
    <div>
      <Link href="/admin/libros" className="text-xs underline">
        ← Volver a libros
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {book.title}</h1>
      <BookForm book={book} />
    </div>
  );
}
