"use client";

import { useEffect, useRef, useState } from "react";

// Muestra la app de estilo (archivos en /public/estilo-app) dentro de la página.
// La app avisa su alto con postMessage y el iframe se ajusta para que no haya doble scroll.
export default function EstiloApp() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [alto, setAlto] = useState(1400);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== ref.current?.contentWindow) return;
      const d = e.data as { tipo?: string; alto?: number } | null;
      if (d && d.tipo === "vb-alto" && typeof d.alto === "number" && d.alto > 200) {
        setAlto(Math.ceil(d.alto) + 8);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src="/estilo-app/index.html"
      title="Test de estilo"
      style={{ height: alto }}
      className="block w-full border-0"
      allow="clipboard-write"
    />
  );
}
