"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 4;

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(255 * f(n))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

type Palette = { id: string; baseHex: string; hexes: string[] };

type Harmony = { label: string; hexes: string[] };

function buildHarmonies(hue: number, sat: number, light: number): Harmony[] {
  const color = (h: number) => hslToHex(h, sat, light);
  return [
    { label: "Complementaria", hexes: [color(hue), color(hue + 180)] },
    { label: "Análoga", hexes: [color(hue - 30), color(hue), color(hue + 30)] },
    { label: "Tríada", hexes: [color(hue), color(hue + 120), color(hue + 240)] },
    { label: "Cuadrada", hexes: [color(hue), color(hue + 90), color(hue + 180), color(hue + 270)] },
  ];
}

export default function ColorWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(340);
  const [sat, setSat] = useState(70);
  const light = 55;
  const [palettes, setPalettes] = useState<Palette[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("colorimetria_palettes");
      if (raw) setPalettes(JSON.parse(raw));
    } catch {
      // localStorage no disponible (SSR/privado): seguimos sin paletas guardadas.
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imageData = ctx.createImageData(SIZE, SIZE);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x - CENTER;
        const dy = y - CENTER;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const i = (y * SIZE + x) * 4;
        if (dist > RADIUS) {
          imageData.data[i + 3] = 0;
          continue;
        }
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const h = (angle + 360) % 360;
        const s = Math.min(100, (dist / RADIUS) * 100);
        const hex = hslToHex(h, s, 55);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  function pickAt(clientX: number, clientY: number, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;
    const dist = Math.min(RADIUS, Math.sqrt(x * x + y * y));
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    setHue((angle + 360) % 360);
    setSat(Math.min(100, (dist / RADIUS) * 100));
  }

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1 && e.type !== "pointerdown") return;
    pickAt(e.clientX, e.clientY, e.currentTarget);
  }

  const baseHex = hslToHex(hue, sat, light);
  const harmonies = buildHarmonies(hue, sat, light);
  const dotAngle = (hue * Math.PI) / 180;
  const dotDist = (sat / 100) * RADIUS;
  const dotX = CENTER + Math.cos(dotAngle) * dotDist;
  const dotY = CENTER + Math.sin(dotAngle) * dotDist;

  function savePalette() {
    const palette: Palette = {
      id: crypto.randomUUID(),
      baseHex,
      hexes: harmonies.flatMap((h) => h.hexes),
    };
    const next = [palette, ...palettes].slice(0, 10);
    setPalettes(next);
    try {
      localStorage.setItem("colorimetria_palettes", JSON.stringify(next));
    } catch {
      // sin localStorage no persiste, pero la paleta igual queda visible en esta sesión.
    }
  }

  function removePalette(id: string) {
    const next = palettes.filter((p) => p.id !== id);
    setPalettes(next);
    try {
      localStorage.setItem("colorimetria_palettes", JSON.stringify(next));
    } catch {
      // ver comentario de arriba.
    }
  }

  return (
    <div className="not-prose my-8 rounded-sm border border-black/10 bg-white p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div
          className="relative flex-shrink-0 touch-none select-none"
          style={{ width: SIZE, height: SIZE }}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
        >
          <canvas ref={canvasRef} width={SIZE} height={SIZE} className="rounded-full" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: dotX, top: dotY, background: baseHex, boxShadow: "0 0 0 1px rgba(0,0,0,.3)" }}
          />
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full border border-black/10" style={{ background: baseHex }} />
            <div>
              <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50">Tu color</p>
              <p className="font-mono text-sm">{baseHex}</p>
            </div>
            <button
              type="button"
              onClick={savePalette}
              className="ml-auto rounded-sm border border-black/15 px-3 py-1.5 text-xs font-medium uppercase tracking-widest hover:bg-soft-bg"
            >
              Guardar
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {harmonies.map((h) => (
              <div key={h.label}>
                <p className="mb-1 text-xs text-[#1a1a1a]/60">{h.label}</p>
                <div className="flex gap-1.5">
                  {h.hexes.map((hex, i) => (
                    <div
                      key={i}
                      title={hex}
                      className="h-8 flex-1 rounded-sm border border-black/10"
                      style={{ background: hex }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {palettes.length > 0 && (
        <div className="mt-8 border-t border-black/10 pt-6">
          <p className="mb-3 text-xs uppercase tracking-widest text-[#1a1a1a]/50">Paletas guardadas</p>
          <div className="flex flex-col gap-2">
            {palettes.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="flex flex-1 overflow-hidden rounded-sm border border-black/10">
                  {p.hexes.map((hex, i) => (
                    <div key={i} title={hex} className="h-7 flex-1" style={{ background: hex }} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removePalette(p.id)}
                  aria-label="Borrar paleta"
                  className="flex-shrink-0 text-xs text-red-600 underline"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
