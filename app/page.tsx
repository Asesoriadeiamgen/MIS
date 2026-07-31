import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BUTTON_PRIMARY, BUTTON_OUTLINE } from "@/lib/ui";
import { IconServicio, IconPack, IconPortfolio, IconBlog, IconTienda, IconAgenda } from "@/components/icons";
import WelcomeGateOverlay from "@/components/WelcomeGateOverlay";

const SECTIONS = [
  {
    href: "/servicios",
    title: "Servicios",
    description: "Colorimetría, guardarropa, personal shopper y más.",
    Icon: IconServicio,
  },
  {
    href: "/packs",
    title: "Packs y programas",
    description: "Sesiones individuales o procesos de varios encuentros.",
    Icon: IconPack,
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Antes y después de clientas reales.",
    Icon: IconPortfolio,
  },
  {
    href: "/blog",
    title: "Blog",
    description: "Tendencias, tips y errores comunes.",
    Icon: IconBlog,
  },
  {
    href: "/tienda",
    title: "Tienda",
    description: "Ebooks, guías descargables y cursos online.",
    Icon: IconTienda,
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
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center md:py-20">
          <Image
            src="/logo-full.png"
            alt="María Isabel Sosa — Asesora y Coach en Imagen"
            width={520}
            height={484}
            className="h-auto w-64 sm:w-80"
            priority
          />
          <h1 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Descubrí tu mejor versión
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

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {SECTIONS.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-3 rounded-sm border border-black/10 bg-white px-5 py-10 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <Icon className="h-9 w-9 text-lilac-deep" />
              <h2 className="font-serif text-xl">{title}</h2>
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
