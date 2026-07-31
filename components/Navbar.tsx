import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MobileNav from "@/components/MobileNav";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

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
          <span className="flex flex-col items-center text-center leading-tight">
            <span className="font-serif text-base tracking-wide whitespace-nowrap text-[#1a1a1a]">
              {SITE_NAME}
            </span>
            <span className="font-script text-base whitespace-nowrap text-lilac-deep">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>
        <MobileNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
