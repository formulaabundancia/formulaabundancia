/**
 * Aritmética de fechas ISO (yyyy-mm-dd) pura, sin noción de "hoy" propia:
 * para "hoy" se usa `todayStr()` de "./storage", igual que el resto de la app,
 * para no introducir una segunda convención de fecha local/UTC.
 */

import { Weekday, WEEKDAYS } from "./fitness-types";

// getDay(): 0 = domingo ... 6 = sábado. Reordenamos a Lunes..Domingo.
export function weekdayFromDate(date: Date): Weekday {
  const jsDay = date.getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return WEEKDAYS[index];
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Días de diferencia (b - a) entre dos fechas ISO. */
export function diffDays(aIso: string, bIso: string): number {
  const a = parseIso(aIso).getTime();
  const b = parseIso(bIso).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Suma (o resta) días a una fecha ISO y devuelve ISO. */
export function addDaysIso(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60 * 1000).toISOString().slice(0, 10);
}
