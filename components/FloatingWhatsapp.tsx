import { IconWhatsapp } from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/seo";

export default function FloatingWhatsapp() {
  const message = encodeURIComponent("Hola! Tengo una consulta.");

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <IconWhatsapp className="h-7 w-7" />
    </a>
  );
}
