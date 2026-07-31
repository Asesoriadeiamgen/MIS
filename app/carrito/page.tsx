import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default async function CarritoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CartView userEmail={user?.email ?? null} />;
}
