import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBackupEmail, ADMIN_EMAIL, type WeeklyStats } from "@/lib/email";

export const maxDuration = 30;

const TABLES = [
  "profiles",
  "servicios",
  "packs",
  "cursos",
  "books",
  "vouchers",
  "testimonios",
  "blog_posts",
  "colorimetria_posts",
  "faqs",
  "turnos",
  "disponibilidad_semanal",
  "bloqueos_fecha",
  "orders",
  "order_items",
  "book_access",
  "discount_codes",
  "about_page",
  "galeria_fotos",
] as const;

function computeWeeklyStats(backup: Record<string, unknown>): WeeklyStats {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const in7days = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date(now).toISOString();

  const profiles = (backup.profiles as { created_at: string }[]) ?? [];
  const orders = (backup.orders as { status: string; total: number; created_at: string }[]) ?? [];
  const orderItems =
    (backup.order_items as { title: string; quantity: number; created_at: string }[]) ?? [];
  const bookAccess =
    (backup.book_access as { created_at: string; redeemed_at: string | null }[]) ?? [];
  const turnos =
    (backup.turnos as { created_at: string; start_at: string; status: string }[]) ?? [];

  const nuevosUsuarios = profiles.filter((p) => p.created_at > weekAgo).length;

  const turnosSemana = turnos.filter((t) => t.created_at > weekAgo);
  const turnosNuevos = turnosSemana.length;
  const turnosConfirmados = turnosSemana.filter((t) => t.status === "confirmado").length;
  const turnosProximaSemana = turnos.filter(
    (t) => t.status === "confirmado" && t.start_at > today && t.start_at <= in7days
  ).length;

  const pedidosSemana = orders.filter((o) => o.created_at > weekAgo);
  const pedidosPagadosSemana = pedidosSemana.filter((o) => o.status === "paid");
  const ingresos = pedidosPagadosSemana.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const itemsSemana = orderItems.filter((i) => i.created_at > weekAgo);
  const counts = new Map<string, number>();
  for (const it of itemsSemana) {
    counts.set(it.title, (counts.get(it.title) || 0) + it.quantity);
  }
  const topProductos = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const codigosGenerados = bookAccess.filter((b) => b.created_at > weekAgo).length;
  const codigosCanjeados = bookAccess.filter(
    (b) => b.redeemed_at && b.redeemed_at > weekAgo
  ).length;

  function activeCount(table: string) {
    return ((backup[table] as { is_active?: boolean }[]) ?? []).filter((r) => r.is_active).length;
  }

  return {
    nuevosUsuarios,
    turnosNuevos,
    turnosConfirmados,
    turnosProximaSemana,
    pedidosNuevos: pedidosSemana.length,
    pedidosPagados: pedidosPagadosSemana.length,
    ingresos,
    codigosGenerados,
    codigosCanjeados,
    topProductos,
    totales: {
      usuarios: profiles.length,
      servicios: activeCount("servicios"),
      formaciones: activeCount("packs"),
      cursos: activeCount("cursos"),
      ebooks: activeCount("books"),
      vouchers: activeCount("vouchers"),
      testimonios: activeCount("testimonios"),
      blogPosts: activeCount("blog_posts"),
      colorimetriaPosts: activeCount("colorimetria_posts"),
    },
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const backup: Record<string, unknown> = {};

  for (const table of TABLES) {
    const { data, error } = await admin.from(table).select("*");
    if (error) {
      console.error(`Backup: error leyendo ${table}`, error);
      continue;
    }
    backup[table] = data ?? [];
  }

  const dateLabel = new Date().toISOString().slice(0, 10);
  const stats = computeWeeklyStats(backup);

  try {
    await sendBackupEmail({
      to: ADMIN_EMAIL,
      jsonContent: JSON.stringify(backup, null, 2),
      dateLabel,
      stats,
    });
  } catch (err) {
    console.error("Backup: error enviando email", err);
    return NextResponse.json({ error: "no se pudo enviar el email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, dateLabel });
}
