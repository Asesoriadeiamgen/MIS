"use client";

import { useTransition } from "react";

export default function ToggleAdminButton(props: {
  id: string;
  isAdmin: boolean;
  disabled?: boolean;
  action: (id: string, isAdmin: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const message = props.isAdmin
      ? "¿Quitarle los permisos de administrador a este usuario?"
      : "¿Darle permisos de administrador a este usuario? Va a poder ver y modificar todo el panel.";
    if (!window.confirm(message)) return;
    startTransition(() => props.action(props.id, !props.isAdmin));
  }

  return (
    <button
      disabled={pending || props.disabled}
      onClick={handleClick}
      title={props.disabled ? "No podés quitarte el admin a vos mismo" : undefined}
      className="text-xs underline disabled:opacity-40"
    >
      {pending ? "Guardando..." : props.isAdmin ? "Quitar admin" : "Hacer admin"}
    </button>
  );
}
