import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTurnoConfirmationEmail, sendTurnoAdminNotificationEmail } from "@/lib/email";

const SLOT_DURATION_MINUTES = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Falta la fecha." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("horarios_disponibles", {
    p_date: date,
    p_duration_minutes: SLOT_DURATION_MINUTES,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slots = (data || []).map((row: { start_at: string }) => row.start_at);
  return NextResponse.json({ slots });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { startAt, servicioNombre, clientName, clientEmail, clientPhone, notes } = body;

  if (!startAt || !clientName || !clientEmail) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: turno, error } = await supabase.rpc("reservar_turno", {
    p_start_at: startAt,
    p_duration_minutes: SLOT_DURATION_MINUTES,
    p_servicio_nombre: servicioNombre || null,
    p_client_name: clientName,
    p_client_email: clientEmail,
    p_client_phone: clientPhone || null,
    p_notes: notes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  await Promise.all([
    sendTurnoConfirmationEmail({
      to: clientEmail,
      clientName,
      servicioNombre: servicioNombre || null,
      startAt,
    }),
    sendTurnoAdminNotificationEmail({
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      servicioNombre: servicioNombre || null,
      startAt,
      notes: notes || null,
    }),
  ]);

  return NextResponse.json({ turno });
}
