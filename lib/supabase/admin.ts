import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente con la service role key: ignora RLS.
 * Usar SOLO en código de servidor de confianza (webhook de Mercado Pago,
 * generación de códigos de acceso, firma de URLs de archivos protegidos).
 * Nunca importar desde un componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
