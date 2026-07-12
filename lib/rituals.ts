import { Habit } from "./types";

export type RitualKey = "manana" | "noche" | "bienestar" | "skincare" | "pareja_manana" | "pareja_noche";

export interface RitualConfig {
  key: RitualKey;
  title: string;
  tips: string[];
}

// Subcabeceras fijas dentro de un ritual (ej. bienestar se divide en
// mañana/noche) — los pasos que hay dentro de cada una son datos (ver
// habits.ritual_group), esto solo define qué grupos existen y cómo se llaman.
export const RITUAL_GROUPS: Record<RitualKey, { id: string; label: string }[] | null> = {
  manana: null,
  noche: null,
  bienestar: [
    { id: "manana", label: "Ritual de la mañana" },
    { id: "noche", label: "Ritual de la noche" },
  ],
  skincare: null,
  pareja_manana: null,
  pareja_noche: null,
};

// Etiqueta que se muestra en cada paso — es la misma para todos los pasos de
// un ritual, así que no hace falta guardarla por hábito.
export const RITUAL_TAG: Record<RitualKey, string> = {
  manana: "Diario",
  noche: "Diario",
  bienestar: "Ritual de bienestar",
  skincare: "Ritual coreano",
  pareja_manana: "Rutina de pareja",
  pareja_noche: "Rutina de pareja",
};

export const RITUALS: RitualConfig[] = [
  {
    key: "manana",
    title: "Ritual de mañana",
    tips: [
      "Cada mañana que te levantas temprano cuando el mundo duerme, estás ganando ventaja real.",
      "No hace falta hacerlo perfecto, solo hacerlo. La constancia gana a la intensidad.",
      "Lo que decretas y agradeces por la mañana marca el tono del resto del día.",
      "Un pequeño paso cada mañana es mejor que un gran salto que nunca llega.",
      "Hoy también es un buen día para empezar de nuevo, sin culpa por ayer.",
      "La disciplina de hoy es la libertad de mañana.",
      "Respira, agradece, y da el primer paso — el resto viene solo.",
    ],
  },
  {
    key: "noche",
    title: "Ritual de noche",
    tips: [
      "Revisa tu día con amabilidad — lo que aprendes hoy es el cimiento de mañana.",
      "Cerrar el día en calma es tan importante como empezarlo con energía.",
      "No te lleves los pendientes de hoy a la cama: planea mañana y suelta.",
      "Cada cosa que aprendiste hoy, por pequeña que sea, cuenta.",
      "Dormir bien es parte del entrenamiento, no una pausa en él.",
      "Un buen cierre de día empieza con soltar el móvil un rato antes.",
    ],
  },
  {
    key: "bienestar",
    title: "Ritual de bienestar",
    tips: [
      "Tu cuerpo rinde mejor cuando le das lo que necesita, a su hora.",
      "La nutrición constante es la base de la energía del día.",
      "Pequeños hábitos de bienestar, sostenidos, cambian mucho más que un mes de esfuerzo puntual.",
      "Cuidar de tu cuerpo por la mañana y por la noche es cuidar de todo lo demás.",
    ],
  },
  {
    key: "skincare",
    title: "Skincare (ritual coreano)",
    tips: ["La constancia importa más que la cantidad de pasos."],
  },
  {
    key: "pareja_manana",
    title: "Rutina de pareja — mañana",
    tips: [
      "Mejor 20 minutos reales juntos que 60 forzados. Lo importante es la conexión.",
      "Empezar el día mirándoos a los ojos cambia el tono de todo lo demás.",
      "Sin móvil los primeros minutos: el mundo puede esperar, vosotros no.",
      "Un abrazo de 20 segundos de verdad reduce el estrés de los dos.",
    ],
  },
  {
    key: "pareja_noche",
    title: "Rutina de pareja — noche",
    tips: [
      "Cerrar el día agradeciendo algo del otro os acerca sin esfuerzo.",
      "Dejar el móvil fuera del dormitorio es el regalo más fácil que os podéis hacer.",
      "No hace falta resolverlo todo hoy: a veces solo hay que escuchar.",
      "Dormir reconciliados es un no negociable que se entrena cada noche.",
    ],
  },
];

// Agrupa hábitos (ya cargados con getHabits({status:'active'})) por el ritual
// al que pertenecen — para páginas que necesitan las claves de todos los
// rituales a la vez (home, estadísticas) sin una consulta por ritual.
export function groupStepsByRitual(habits: Habit[]): Partial<Record<RitualKey, string[]>> {
  const result: Partial<Record<RitualKey, string[]>> = {};
  for (const h of habits) {
    if (!h.ritualKey) continue;
    const key = h.ritualKey as RitualKey;
    (result[key] ??= []).push(h.key);
  }
  return result;
}

export function getRitual(key: RitualKey): RitualConfig {
  const ritual = RITUALS.find((r) => r.key === key);
  if (!ritual) throw new Error(`Ritual desconocido: ${key}`);
  return ritual;
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function dailyTip(ritual: RitualConfig): string {
  if (ritual.tips.length === 0) return "";
  const idx = dayOfYear(new Date()) % ritual.tips.length;
  return ritual.tips[idx];
}
