import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBirthdayEmail } from "@/lib/email";
import { generateCouponCode } from "@/lib/codes";

export const maxDuration = 30;

const BIRTHDAY_DISCOUNT_PERCENT = 10;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // "Hoy" en horario argentino, no UTC (el cron corre en UTC).
  const argNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );
  const day = argNow.getDate();
  const month = argNow.getMonth() + 1;

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("birth_day", day)
    .eq("birth_month", month);

  if (error) {
    console.error("Cumpleaños: error consultando profiles", error);
    return NextResponse.json({ error: "error de base de datos" }, { status: 500 });
  }

  let sent = 0;
  for (const profile of profiles ?? []) {
    try {
      const couponCode = generateCouponCode("CUMPLE");
      const { error: couponError } = await admin
        .from("discount_codes")
        .insert({ code: couponCode, percent_off: BIRTHDAY_DISCOUNT_PERCENT, is_active: true });
      if (couponError) throw couponError;

      await sendBirthdayEmail({
        to: profile.email,
        name: profile.full_name?.split(" ")[0] || "",
        couponCode,
        percentOff: BIRTHDAY_DISCOUNT_PERCENT,
      });
      sent += 1;
    } catch (err) {
      console.error(`Cumpleaños: error enviando a ${profile.email}`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
