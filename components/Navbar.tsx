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
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <Image src="/logo-icon.png" alt="" width={56} height={56} className="h-14 w-14" />
          <span className="flex flex-col items-center text-center leading-tight">
            <span className="font-serif text-sm tracking-wide whitespace-nowrap text-[#1a1a1a] sm:text-base">
              {SITE_NAME}
            </span>
            <span className="font-script text-sm whitespace-nowrap text-lilac-deep sm:text-base">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>
        <MobileNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
