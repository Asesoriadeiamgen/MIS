import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MobileNav from "@/components/MobileNav";
import { SITE_NAME } from "@/lib/seo";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fffdfb]/90 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-2xl tracking-wide text-[#1a4077]"
        >
          <Image src="/logo-icon.png" alt="" width={36} height={36} className="h-9 w-9" />
          {SITE_NAME}
        </Link>
        <MobileNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
