"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Botón de submit para <form action={serverAction}> nativos (sin onSubmit
 * propio). Se deshabilita en el primer clic para que un doble/triple clic no
 * dispare la Server Action más de una vez — el form ya venía en camino de
 * todos modos, esto solo bloquea los clics extra mientras navega.
 */
export default function SubmitOnceButton({
  children,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button type="submit" disabled={pending} onClick={() => setPending(true)} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
