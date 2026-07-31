import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function ProductCard(props: {
  href: string;
  image: string | null;
  title: string;
  subtitle?: string | null;
  price: number | null;
}) {
  return (
    <Link
      href={props.href}
      className="group flex flex-col overflow-hidden rounded-sm border border-black/12 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-lilac/30">
        {props.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.image}
            alt={props.title}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-[#2b2622]/30">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-serif text-lg leading-snug">{props.title}</h3>
        {props.subtitle && <p className="text-xs text-[#2b2622]/50">{props.subtitle}</p>}
        <p className="mt-auto border-t border-black/10 pt-2 font-semibold">
          {formatPrice(props.price)}
        </p>
      </div>
    </Link>
  );
}
