// Áreas fijas de la Rueda de la vida (estilo clásico de coaching, 8 quesitos).
export const WHEEL_AREAS: { id: string; label: string; color: string }[] = [
  { id: "salud", label: "Salud", color: "#f59e0b" },
  { id: "dinero", label: "Dinero", color: "#eab308" },
  { id: "amor", label: "Amor", color: "#22c55e" },
  { id: "familia", label: "Familia", color: "#14b8a6" },
  { id: "amigos", label: "Amigos", color: "#ef4444" },
  { id: "ocio", label: "Ocio", color: "#a855f7" },
  { id: "desarrollo", label: "Desarrollo personal", color: "#6366f1" },
  { id: "profesion", label: "Profesión", color: "#3b82f6" },
];

// Primer día del mes actual, en formato YYYY-MM-DD (UTC, como el resto de fechas).
export function currentMonthStr(): string {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

// Desplaza un mes (YYYY-MM-DD, día 1) n meses.
export function shiftMonth(mesStr: string, n: number): string {
  const d = new Date(`${mesStr}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return `${d.toISOString().slice(0, 7)}-01`;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function monthLabel(mesStr: string): string {
  const [y, m] = mesStr.split("-").map(Number);
  return `${MESES[m - 1]} ${y}`;
}
