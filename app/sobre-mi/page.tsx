import Image from "next/image";
import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/ui";
import { SITE_NAME, buildSocialMeta } from "@/lib/seo";

export const metadata = {
  title: `Sobre mí — ${SITE_NAME}`,
  ...buildSocialMeta({
    title: `Sobre mí — ${SITE_NAME}`,
    description: "Formación, filosofía de trabajo e historia detrás de la asesoría de imagen.",
    path: "/sobre-mi",
  }),
};

export default function SobreMiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60">
        Sobre mí
      </p>
      <h1 className="text-center font-serif text-3xl sm:text-4xl">{SITE_NAME}</h1>

      <div className="my-10 flex justify-center">
        <Image
          src="/logo-icon.png"
          alt={SITE_NAME}
          width={160}
          height={160}
          className="h-32 w-32"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Formación y certificaciones</h2>
        <p className="text-[#1a1a1a]/70">
          [Falta cargar: formación, cursos y certificaciones. Se puede editar este texto una vez
          que llegue el material a la carpeta compartida.]
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-xl">Filosofía de trabajo</h2>
        <p className="text-[#1a1a1a]/70">
          La imagen como coherencia entre lo interno y lo externo: no se trata solo de qué usás,
          sino de que lo que mostrás hacia afuera refleje quién sos por dentro.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-xl">Mi historia</h2>
        <p className="text-[#1a1a1a]/70">
          [Falta cargar: historia personal/profesional que genere conexión con quien lee.]
        </p>
      </section>

      <div className="mt-12 text-center">
        <Link href="/agenda" className={BUTTON_PRIMARY}>
          Agendá tu consulta
        </Link>
      </div>
    </div>
  );
}
