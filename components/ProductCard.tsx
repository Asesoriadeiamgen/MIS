import Link from "next/link";
import type { ComponentType } from "react";
import { formatPrice } from "@/lib/format";

export default function ProductCard(props: {
  href: string;
  image: string | null;
  title: string;
  subtitle?: string | null;
  price: number | null;
  icon?: ComponentType<{ className?: string }>;
}) {
  const Icon = props.icon;
  return (
    <Link
      href={props.href}
      className="group flex flex-col overflow-hidden rounded-sm border border-black/12 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-soft-bg">
        {props.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.image}
            alt={props.title}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        ) : Icon ? (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-10 w-10 text-lilac-deep" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-[#1a1a1a]/30">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="flex items-center gap-1.5 font-serif text-lg leading-snug">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-lilac-deep" />}
          {props.title}
        </h3>
        {props.subtitle && <p className="text-xs text-[#1a1a1a]/50">{props.subtitle}</p>}
        <p className="mt-auto border-t border-black/10 pt-2 font-semibold">
          {formatPrice(props.price)}
        </p>
      </div>
    </Link>
  );
}
