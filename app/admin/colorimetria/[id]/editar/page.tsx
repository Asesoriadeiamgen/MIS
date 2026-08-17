import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ColorimetriaPostForm from "@/components/admin/ColorimetriaPostForm";

export default async function EditarColorimetriaPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("colorimetria_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/colorimetria" className="text-xs underline">
        ← Volver a colorimetría
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar artículo</h1>
      <ColorimetriaPostForm post={post} />
    </div>
  );
}
