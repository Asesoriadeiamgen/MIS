import { IconWhatsapp } from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/seo";

export default function WhatsappDeliveryNote(props: { label?: string; message?: string }) {
  const label = props.label || "Envíe un wsp para agendar su entrega.";
  const message = encodeURIComponent(
    props.message || "Hola! Quiero agendar el envío/entrega de mi pedido personalizado."
  );

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-sm border border-black/15 bg-soft-bg px-4 py-3 text-sm text-[#1a1a1a] transition hover:bg-soft-bg-deep"
    >
      <IconWhatsapp className="h-5 w-5 flex-shrink-0" />
      <span>{label}</span>
    </a>
  );
}
