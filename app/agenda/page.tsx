import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AgendaBookingForm from "@/components/AgendaBookingForm";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Agendá tu turno";
const description = `Elegí día y horario para tu consulta con ${SITE_NAME}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/agenda" },
  ...buildSocialMeta({ title, description, path: "/agenda" }),
};

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Agendá tu turno</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Elegí día y horario, y coordinamos tu consulta.</p>

      <AgendaBookingForm servicios={servicios ?? []} />

      <div className="mt-8">
        <WhatsappDeliveryNote
          label="¿Preferís coordinar por WhatsApp?"
          message="Hola! Quiero agendar una consulta."
        />
      </div>
    </div>
  );
}
