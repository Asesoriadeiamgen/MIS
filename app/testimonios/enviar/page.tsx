import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitTestimonio } from "@/app/testimonios/actions";
import { BUTTON_PRIMARY, INPUT, LABEL } from "@/lib/ui";

export const metadata = { title: "Dejá tu testimonio" };

export default async function EnviarTestimonioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/login?next=/testimonios/enviar");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Link href="/testimonios" className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 hover:text-lilac-deep">
        ← Volver a testimonios
      </Link>
      <h1 className="mb-2 mt-3 font-serif text-3xl">Dejá tu testimonio</h1>
      <p className="mb-8 text-sm text-[#1a1a1a]/60">
        Lo revisamos antes de publicarlo — no aparece en la página automáticamente.
      </p>

      {sent ? (
        <p className="rounded-sm bg-lilac/20 p-4 text-sm text-[#1a1a1a]/80">
          ¡Gracias! Tu testimonio va a mostrarse en la página una vez que lo revisemos.
        </p>
      ) : (
        <form action={submitTestimonio} className="flex flex-col gap-4">
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="client_name">
              Tu nombre
            </label>
            <input
              id="client_name"
              name="client_name"
              required
              defaultValue={profile?.full_name ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="quote">
              Tu testimonio
            </label>
            <textarea id="quote" name="quote" required rows={5} className={INPUT} />
          </div>
          <div>
            <label className={`mb-1.5 block ${LABEL}`} htmlFor="rating">
              Puntaje (opcional)
            </label>
            <select id="rating" name="rating" defaultValue="" className={INPUT}>
              <option value="">Sin puntaje</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className={BUTTON_PRIMARY}>
            Enviar testimonio
          </button>
        </form>
      )}
    </div>
  );
}
