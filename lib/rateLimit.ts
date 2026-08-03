import { createAdminClient } from "@/lib/supabase/admin";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

/**
 * Registra un intento bajo `key` y devuelve true si ya se pasó el límite
 * en la ventana de tiempo (y por lo tanto hay que rechazar este intento).
 * Usa rate_limit_events, una tabla sin policies públicas: solo el server
 * (service role) la toca.
 */
export async function isRateLimited(key: string, limit: number, windowMinutes: number): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count } = await admin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);

  if ((count ?? 0) >= limit) return true;

  await admin.from("rate_limit_events").insert({ key });
  return false;
}
