"use client";

import { useTransition } from "react";

export default function DeleteButton(props: {
  id: string;
  label?: string;
  confirmMessage?: string;
  action: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      props.confirmMessage || "¿Borrar esto de forma permanente? No se puede deshacer."
    );
    if (!confirmed) return;
    startTransition(() => props.action(props.id));
  }

  return (
    <button
      disabled={pending}
      onClick={handleClick}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      {pending ? "Borrando..." : props.label || "Borrar"}
    </button>
  );
}
