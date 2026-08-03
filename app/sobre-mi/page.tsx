import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { BUTTON_PRIMARY } from "@/lib/ui";
import { SITE_NAME, buildSocialMeta } from "@/lib/seo";

export const metadata = {
  title: `Sobre mí — ${SITE_NAME}`,
  keywords: [
    "asesora de imagen",
    "coach de imagen",
    "quién es " + SITE_NAME,
    "formación asesoría de imagen",
  ],
  ...buildSocialMeta({
    title: `Sobre mí — ${SITE_NAME}`,
    description: "Formación, filosofía de trabajo e historia detrás de la asesoría de imagen.",
    path: "/sobre-mi",
  }),
};

const PROSE_CLASS =
  "prose prose-sm max-w-none text-[#1a1a1a]/70 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc";

export default async function SobreMiPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about_page").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60">
        Sobre mí
      </p>
      <h1 className="text-center font-serif text-3xl sm:text-4xl">{SITE_NAME}</h1>

      <div className="my-10 flex justify-center">
        {about?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={about.photo_url}
            alt={SITE_NAME}
            className="h-32 w-32 rounded-full object-cover object-top"
          />
        ) : (
          <Image
            src="/logo-icon.png"
            alt={SITE_NAME}
            width={160}
            height={160}
            className="h-32 w-32"
          />
        )}
      </div>

      {about?.historia_html && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl">Mi historia</h2>
          <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.historia_html) }} />
        </section>
      )}

      {about?.filosofia_html && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-xl">Filosofía de trabajo</h2>
          <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.filosofia_html) }} />
        </section>
      )}

      {about?.formacion_html && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-xl">Formación y certificaciones</h2>
          <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.formacion_html) }} />
        </section>
      )}

      <div className="mt-12 text-center">
        <Link href="/agenda" className={BUTTON_PRIMARY}>
          Agendá tu consulta
        </Link>
      </div>
    </div>
  );
}
