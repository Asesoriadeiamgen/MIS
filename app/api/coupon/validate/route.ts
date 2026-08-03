import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";

  if (!code) {
    return NextResponse.json({ valid: false, error: "Ingresá un código." }, { status: 400 });
  }

  const ip = getClientIp(request);
  if (await isRateLimited(`coupon:${ip}`, 5, 60)) {
    return NextResponse.json(
      { valid: false, error: "Demasiados intentos. Probá de nuevo en un rato." },
      { status: 429 }
    );
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("discount_codes")
    .select("code, percent_off, amount_off, is_active")
    .eq("code", code)
    .maybeSingle();

  if (!data || !data.is_active) {
    return NextResponse.json({ valid: false, error: "Código inválido." }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    code: data.code,
    percentOff: data.percent_off,
    amountOff: data.amount_off,
  });
}
