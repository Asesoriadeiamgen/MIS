import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BUTTON_PRIMARY, BUTTON_OUTLINE } from "@/lib/ui";
import {
  IconPerfil,
  IconServicio,
  IconFormacion,
  IconPortfolio,
  IconTestimonio,
  IconBlog,
  IconBook,
  IconTienda,
  IconFaq,
  IconAgenda,
} from "@/components/icons";
import WelcomeGateOverlay from "@/components/WelcomeGateOverlay";

const SECTIONS = [
  {
    href: "/sobre-mi",
    title: "Sobre mí",
    description: "Formación, filosofía e historia.",
    Icon: IconPerfil,
  },
  {
    href: "/servicios",
    title: "Servicios",
    description: "Asesoría de imagen y mucho más.",
    Icon: IconServicio,
  },
  {
    href: "/formaciones",
    title: "Formaciones",
    description: "Carreras, especializaciones y mentorías para asesoras de imagen.",
    Icon: IconFormacion,
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Antes y después de clientas reales.",
    Icon: IconPortfolio,
  },
  {
    href: "/testimonios",
    title: "Testimonios",
    description: "Lo que dicen mis clientas.",
    Icon: IconTestimonio,
  },
  {
    href: "/blog",
    title: "Blog",
    description: "Tendencias, tips y errores comunes.",
    Icon: IconBlog,
  },
  {
    href: "/libros",
    title: "Ebooks",
    description: "Guías digitales descargables.",
    Icon: IconBook,
  },
  {
    href: "/tienda",
    title: "Tienda",
    description: "Ebooks, guías descargables y cursos online.",
    Icon: IconTienda,
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "Dudas comunes sobre el servicio.",
    Icon: IconFaq,
  },
  {
    href: "/agenda",
    title: "Agendá tu turno",
    description: "Elegí día y horario para tu consulta.",
    Icon: IconAgenda,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: testimonios } = await supabase
    .from("testimonios")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(3);

  return (
    <div>
      <WelcomeGateOverlay />

      <section className="bg-soft-bg">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 pb-10 pt-6 text-center sm:pt-8">
          <Image
            src="/logo-full.png"
            alt="María Isabel Sosa — Asesora y Coach en Imagen"
            width={520}
            height={484}
            className="h-auto w-52 sm:w-64"
            priority
          />
          <h1 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Imagen, autoconocimiento y presencia
          </h1>
          <p className="max-w-xl text-[#1a1a1a]/70">
            Asesoría de imagen y coaching personal, online y presencial:
            <br />
            la imagen como coherencia entre lo interno y lo externo.
          </p>
          <p className="font-script text-3xl text-lilac-deep">No te dejes para después.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/agenda" className={BUTTON_PRIMARY}>
              Agendá tu consulta
            </Link>
            <Link href="/servicios" className={BUTTON_OUTLINE}>
              Conocé los servicios
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 pt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {SECTIONS.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 rounded-sm border border-black/10 bg-white px-4 py-6 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <Icon className="h-7 w-7 text-lilac-deep" />
              <h2 className="font-serif text-base">{title}</h2>
              <p className="text-xs text-[#1a1a1a]/60">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {testimonios && testimonios.length > 0 && (
        <section className="bg-soft-bg">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="mb-8 text-center font-serif text-2xl">Lo que dicen mis clientas</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {testimonios.map((t) => (
                <div key={t.id} className="rounded-sm border border-black/10 bg-white p-6 text-sm">
                  <p className="text-[#1a1a1a]/80">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 font-medium">{t.client_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="font-serif text-2xl">¿Lista para dar el siguiente paso?</h2>
        <p className="mt-3 text-[#1a1a1a]/70">Escribime y coordinamos tu primera consulta.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/agenda" className={BUTTON_PRIMARY}>
            Agendá tu consulta
          </Link>
        </div>
      </section>
    </div>
  );
}
