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

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** "2026-03" -> "Marzo 2026". Devuelve el valor tal cual si no matchea el formato esperado. */
export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;
  return `${MESES[monthIndex]} ${match[1]}`;
}

/** "5 de Agosto", o null si el perfil no tiene el cumpleaños cargado. */
export function formatBirthday(
  day: number | null | undefined,
  month: number | null | undefined
): string | null {
  if (!day || !month || month < 1 || month > 12) return null;
  return `${day} de ${MESES[month - 1]}`;
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

/** Precio de una formación: si se factura por mes, aclara "/ mes" al lado. */
export function formatPackPrice(price: number | null | undefined, durationUnit: string): string {
  const formatted = formatPrice(price);
  if (price === null || price === undefined || durationUnit !== "meses") return formatted;
  return `${formatted} / mes`;
}
