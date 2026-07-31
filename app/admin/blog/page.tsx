import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import BlogPostForm from "@/components/admin/BlogPostForm";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";
import { toggleBlogPostActive, deleteBlogPost } from "@/app/admin/actions";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Blog</h1>
      <BlogPostForm />

      <ul className="mt-8 flex flex-col gap-2">
        {posts?.map((post) => (
          <li key={post.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{post.title}</p>
              <p className="text-xs text-gray-500">
                {formatDate(post.published_at)} · {post.is_active ? "Publicado" : "Borrador"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/admin/blog/${post.id}/editar`} className="text-xs underline">
                Editar
              </Link>
              <ToggleActiveButton id={post.id} isActive={post.is_active} action={toggleBlogPostActive} />
              <DeleteButton
                id={post.id}
                action={deleteBlogPost}
                confirmMessage={`¿Borrar "${post.title}" de forma permanente?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
