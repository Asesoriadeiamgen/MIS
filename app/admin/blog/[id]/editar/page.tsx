import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditarBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();

  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/blog" className="text-xs underline">
        ← Volver al blog
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-semibold">Editar: {post.title}</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
