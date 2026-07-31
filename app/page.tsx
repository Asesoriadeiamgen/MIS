import Link from "next/link";
import { IconBook, IconAgenda, IconArtesania, IconVarios, IconCurso } from "@/components/icons";
import WelcomeGateOverlay from "@/components/WelcomeGateOverlay";

const SECTIONS = [
  {
    href: "/libros",
    title: "Libros",
    description: "Accedé pagando o con un código.",
    bg: "bg-pink-soft",
    Icon: IconBook,
  },
  {
    href: "/agendas",
    title: "Agendas",
    description: "Elegí opciones y subí tus fotos.",
    bg: "bg-blue-soft",
    Icon: IconAgenda,
  },
  {
    href: "/artesanias",
    title: "Artesanías",
    description: "Piezas hechas a mano, a tu gusto.",
    bg: "bg-mint",
    Icon: IconArtesania,
  },
  {
    href: "/cursos",
    title: "Cursos",
    description: "Talleres con fecha y duración.",
    bg: "bg-peach-soft",
    Icon: IconCurso,
  },
  {
    href: "/varios",
    title: "Varios",
    description: "Otros productos de la tienda.",
    bg: "bg-yellow-soft",
    Icon: IconVarios,
  },
];

export default function Home() {
  return (
    <div>
      <WelcomeGateOverlay />

      <section className="bg-lilac/50">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#2b2622]/60">
            Bienvenido
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Libros, agendas y artesanías
            <br />
            con tu toque personal
          </h1>
          <p className="mt-4 text-[#2b2622]/70">
            Libros digitales de Flores de Bach, Reiki y cuentos infantiles, agendas personalizadas,
            artesanías hechas a mano y cursos con fecha de inicio. Elegí una categoría para
            empezar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {SECTIONS.map(({ href, title, description, bg, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col items-center gap-3 rounded-sm border border-black/10 ${bg} px-5 py-10 text-center transition hover:-translate-y-0.5 hover:shadow-sm`}
            >
              <Icon className="h-9 w-9 text-[#2b2622]/80" />
              <h2 className="font-serif text-xl">{title}</h2>
              <p className="text-xs text-[#2b2622]/60">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
