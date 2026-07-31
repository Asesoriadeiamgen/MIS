import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/ui";

export default function CheckoutPendingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="mb-3 font-serif text-3xl">Tu pago está pendiente</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Te avisaremos por email apenas se confirme. Podés revisar el estado en tu cuenta.
      </p>
      <Link href="/cuenta/perfil" className={BUTTON_PRIMARY}>
        Ver mis pedidos
      </Link>
    </div>
  );
}
