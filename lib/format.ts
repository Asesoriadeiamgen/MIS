export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Consultar precio";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatTime(value: string): string {
  return value.slice(0, 5);
}

const DURATION_UNIT_LABELS: Record<string, [string, string]> = {
  sesiones: ["sesión", "sesiones"],
  meses: ["mes", "meses"],
  semanas: ["semana", "semanas"],
  dias: ["día", "días"],
  horas: ["hora", "horas"],
};

export function formatDuration(count: number | null | undefined, unit: string): string | null {
  if (!count) return null;
  const [singular, plural] = DURATION_UNIT_LABELS[unit] ?? DURATION_UNIT_LABELS.sesiones;
  return `${count} ${count === 1 ? singular : plural}`;
}
