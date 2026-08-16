"use client";

import { useRef, useState } from "react";
import { sendVoucherPurchaseEmail } from "@/app/admin/actions";
import { BUTTON_PRIMARY, INPUT } from "@/lib/ui";

export default function SendVoucherEmailForm(props: { voucherId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isGift, setIsGift] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setSending(true);
    setError(null);
    try {
      await sendVoucherPurchaseEmail(formData);
      setSent(true);
      formRef.current.reset();
      setIsGift(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input type="hidden" name="voucher_id" value={props.voucherId} />
      <input name="buyer_name" placeholder="Nombre de quien compra" required className={INPUT} />
      <input name="buyer_email" type="email" placeholder="Email de quien compra" required className={INPUT} />
      <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
        <input
          type="checkbox"
          name="is_gift"
          checked={isGift}
          onChange={(e) => setIsGift(e.target.checked)}
        />
        Es para regalo (le mandamos copia a la persona regalada)
      </label>
      {isGift && (
        <>
          <input name="recipient_name" placeholder="Nombre de quien recibe el regalo" className={INPUT} />
          <input
            name="recipient_email"
            type="email"
            placeholder="Email de quien recibe el regalo"
            required={isGift}
            className={INPUT}
          />
        </>
      )}
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      {sent && <p className="text-sm text-green-700 sm:col-span-2">Mail enviado.</p>}
      <button type="submit" disabled={sending} className={`sm:col-span-2 ${BUTTON_PRIMARY}`}>
        {sending ? "Enviando..." : "Enviar voucher por mail"}
      </button>
    </form>
  );
}
