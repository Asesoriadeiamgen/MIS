"use client";

import { useEffect, useState } from "react";
import { BUTTON_PRIMARY, INPUT, LABEL } from "@/lib/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AgendaBookingForm(props: { servicios: { id: string; name: string }[] }) {
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function loadSlots(forDate: string) {
    setLoadingSlots(true);
    fetch(`/api/agenda?date=${forDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }

  // Carga inicial al montar; los cambios de fecha los dispara handleDateChange directamente
  // (no un efecto por `date`), para no setear estado sincrónicamente dentro del efecto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial legítimo (patrón "fetch on mount" documentado por React)
    loadSlots(date);
  }, []);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    setDate(newDate);
    setSelectedSlot(null);
    loadSlots(newDate);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: selectedSlot,
          servicioNombre: formData.get("servicio") || null,
          clientName: formData.get("client_name"),
          clientEmail: formData.get("client_email"),
          clientPhone: formData.get("client_phone"),
          notes: formData.get("notes"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo reservar el turno.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reservar el turno.");
      // El horario pudo haberse ocupado justo ahora: refrescamos la lista.
      setLoadingSlots(true);
      fetch(`/api/agenda?date=${date}`)
        .then((r) => r.json())
        .then((data) => setSlots(data.slots || []))
        .finally(() => setLoadingSlots(false));
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-sm border border-black/10 bg-white p-6 text-center">
        <p className="font-serif text-xl">¡Turno confirmado!</p>
        <p className="mt-2 text-sm text-[#1a1a1a]/70">
          Te enviamos un mail con los detalles. ¡Nos vemos pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={LABEL}>Elegí una fecha</label>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={handleDateChange}
          className={`${INPUT} mt-1`}
        />
      </div>

      <div>
        <label className={LABEL}>Horarios disponibles</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {loadingSlots ? (
            <p className="text-sm text-[#1a1a1a]/50">Buscando horarios...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#1a1a1a]/50">No hay horarios libres ese día. Probá otra fecha.</p>
          ) : (
            slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-sm border px-3 py-2 text-sm transition ${
                  selectedSlot === slot
                    ? "border-lilac-deep bg-lilac-deep text-white"
                    : "border-black/15 hover:border-black/40"
                }`}
              >
                {new Date(slot).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Argentina/Buenos_Aires",
                })}
              </button>
            ))
          )}
        </div>
      </div>

      {selectedSlot && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-sm border border-black/10 bg-white p-5 sm:grid-cols-2">
          {props.servicios.length > 0 && (
            <select name="servicio" defaultValue="" className={`${INPUT} sm:col-span-2`}>
              <option value="">Motivo de consulta (opcional)</option>
              {props.servicios.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <input name="client_name" placeholder="Nombre y apellido" required className={INPUT} />
          <input name="client_email" type="email" placeholder="Email" required className={INPUT} />
          <input name="client_phone" placeholder="Teléfono (opcional)" className={INPUT} />
          <textarea name="notes" placeholder="Notas (opcional)" className={INPUT} />
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <button type="submit" disabled={submitting} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
            {submitting ? "Reservando..." : "Confirmar turno"}
          </button>
        </form>
      )}
    </div>
  );
}
