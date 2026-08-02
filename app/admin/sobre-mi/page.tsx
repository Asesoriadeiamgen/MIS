import { createClient } from "@/lib/supabase/server";
import AboutPageForm from "@/components/admin/AboutPageForm";

export default async function AdminSobreMiPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about_page").select("*").eq("id", 1).maybeSingle();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sobre mí</h1>
      <AboutPageForm about={about} />
    </div>
  );
}
