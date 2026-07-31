"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/login?next=/cuenta/perfil");

  const phone = String(formData.get("phone") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();

  await supabase.from("profiles").update({ phone: phone || null, full_name: fullName || null }).eq("id", user.id);

  if (email && email !== user.email) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      redirect(`/cuenta/perfil?error=${encodeURIComponent(error.message)}`);
    }
    revalidatePath("/cuenta/perfil");
    redirect("/cuenta/perfil?emailPending=1");
  }

  revalidatePath("/cuenta/perfil");
  redirect("/cuenta/perfil?updated=1");
}
