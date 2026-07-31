"use client";

import { useTransition } from "react";

export default function ToggleActiveButton(props: {
  id: string;
  isActive: boolean;
  action: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => props.action(props.id, !props.isActive))}
      className="text-xs underline disabled:opacity-50"
    >
      {props.isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
