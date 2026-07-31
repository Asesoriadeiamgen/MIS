"use client";

import { useState, useTransition, type ReactNode } from "react";

type DraggableItem = { id: string; content: ReactNode };

export default function DraggableList({
  items,
  reorderAction,
}: {
  items: DraggableItem[];
  reorderAction: (orderedIds: string[]) => Promise<void>;
}) {
  const idsKey = items
    .map((item) => item.id)
    .sort()
    .join(",");

  const [order, setOrder] = useState<string[]>(() => items.map((item) => item.id));
  const [lastIdsKey, setLastIdsKey] = useState(idsKey);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Ítems agregados o borrados desde afuera: resincronizar. Ver "adjusting state when a prop changes"
  // en la doc de React — se ajusta durante el render, no en un efecto, para evitar un render de más.
  if (idsKey !== lastIdsKey) {
    setLastIdsKey(idsKey);
    setOrder(items.map((item) => item.id));
  }

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.map((id) => byId.get(id)).filter((item): item is DraggableItem => !!item);

  function handlePointerDown(id: string, e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    setDraggingId(id);

    // Se rastrea acá, no en una ref actualizada durante el render: al soltar el mouse el
    // render con la última posición todavía puede no haberse aplicado, y una ref quedaría vieja.
    let latestOrder = order;

    function handleMove(ev: PointerEvent) {
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      const li = target instanceof Element ? target.closest("[data-drag-id]") : null;
      const overId = li instanceof HTMLElement ? li.dataset.dragId : undefined;
      if (!overId || overId === id) return;
      const from = latestOrder.indexOf(id);
      const to = latestOrder.indexOf(overId);
      if (from === -1 || to === -1 || from === to) return;
      const next = [...latestOrder];
      next.splice(from, 1);
      next.splice(to, 0, id);
      latestOrder = next;
      setOrder(next);
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      setDraggingId(null);
      startTransition(() => {
        reorderAction(latestOrder);
      });
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <ul className="mt-8 flex flex-col gap-2">
      {ordered.map((item) => (
        <li
          key={item.id}
          data-drag-id={item.id}
          className={`flex items-center gap-2 rounded-md border p-3 ${
            draggingId === item.id ? "opacity-50" : ""
          }`}
        >
          <span
            onPointerDown={(e) => handlePointerDown(item.id, e)}
            className="cursor-grab select-none touch-none px-1 text-gray-400 active:cursor-grabbing"
            title="Arrastrar para reordenar"
          >
            ⠿
          </span>
          <div className="flex flex-1 items-center justify-between gap-4">{item.content}</div>
        </li>
      ))}
    </ul>
  );
}
