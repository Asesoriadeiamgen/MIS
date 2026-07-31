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
    <header className="sticky top-0 z-10 border-b border-black/10 bg-[#ffffff]/90 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={48} height={48} className="h-12 w-12" />
          <Image
            src="/logo-text.png"
            alt={SITE_NAME}
            width={900}
            height={261}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>
        <MobileNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
