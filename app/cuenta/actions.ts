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
  const dni = String(formData.get("dni") || "").trim();
  const birthDay = Number(formData.get("birth_day")) || null;
  const birthMonth = Number(formData.get("birth_month")) || null;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      phone: phone || null,
      full_name: fullName || null,
      dni: dni || null,
      birth_day: birthDay,
      birth_month: birthMonth,
    })
    .eq("id", user.id);

  if (profileError) {
    redirect(`/cuenta/perfil?error=${encodeURIComponent(profileError.message)}`);
  }

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
