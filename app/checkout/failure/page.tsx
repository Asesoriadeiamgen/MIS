import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/ui";

export default function CheckoutFailurePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="mb-3 font-serif text-3xl">El pago no se pudo completar</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Podés intentarlo de nuevo desde tu carrito. Si el problema persiste, probá con otro medio de
        pago.
      </p>
      <Link href="/carrito" className={BUTTON_PRIMARY}>
        Volver al carrito
      </Link>
    </div>
  );
}
