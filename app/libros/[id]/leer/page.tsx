import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function LeerLibroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/cuenta/login?next=/libros/${id}/leer`);

  const { data: access } = await supabase
    .from("book_access")
    .select("id")
    .eq("book_id", id)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();

  if (!book) redirect("/libros");

  if (!access) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">No tenés acceso a este libro</h1>
        <p className="text-gray-600 mb-6">Comprá el libro o ingresá tu código de acceso.</p>
        <Link href={`/libros/${id}`} className="underline">
          Volver al libro
        </Link>
      </div>
    );
  }

  if (!book.file_path) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Este libro todavía no tiene un archivo cargado</h1>
        <p className="text-gray-600">Escribinos si acabás de comprarlo y no ves el contenido.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("books")
    .createSignedUrl(book.file_path, 60 * 10);

  const isZip = book.file_path.toLowerCase().endsWith(".zip");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{book.title}</h1>
        {signed && (
          <a
            href={signed.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Descargar
          </a>
        )}
      </div>
      {!signed ? (
        <p className="text-sm text-red-600">No se pudo generar el enlace de lectura. Probá recargar la página.</p>
      ) : isZip ? (
        <div className="rounded-md border p-10 text-center">
          <p className="mb-4 text-sm text-gray-600">
            Este contenido incluye varios archivos comprimidos en un ZIP. Descargalo y descomprimilo para ver
            todo el material.
          </p>
          <a
            href={signed.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-md border px-6 py-3 text-sm font-medium"
          >
            Descargar ZIP
          </a>
        </div>
      ) : (
        <iframe src={signed.signedUrl} className="h-[80vh] w-full rounded-md border" />
      )}
    </div>
  );
}
