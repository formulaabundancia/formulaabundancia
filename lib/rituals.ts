export type RitualKey = "manana" | "noche" | "bienestar" | "skincare";

export interface RitualStepGroup {
  label: string;
  steps: string[]; // habit keys, en orden
}

export interface RitualConfig {
  key: RitualKey;
  title: string;
  tips: string[];
  steps: string[]; // habit keys, en orden (aplanado — igual que antes para el resto del código)
  groups?: RitualStepGroup[]; // subcabeceras opcionales dentro del bloque (p.ej. mañana/noche)
}

export interface StepMeta {
  icon: string;
  time?: string;
  tag: string;
}

export const STEP_META: Record<string, StepMeta> = {
  manana_despertar_agua: { icon: "💧", time: "5:00–5:05", tag: "Diario" },
  manana_bano: { icon: "🚿", time: "5:05–5:20", tag: "Diario" },
  manana_agradecer_meditar: { icon: "🙏", time: "5:20–5:35", tag: "Diario" },
  manana_journal_objetivo: { icon: "✍️", time: "5:35–5:50", tag: "Diario" },
  manana_lectura: { icon: "📖", time: "5:50–6:20", tag: "Diario" },
  noche_ducha: { icon: "🧴", time: "19:30–19:45", tag: "Diario" },
  noche_revision_dia: { icon: "📓", time: "19:45–20:00", tag: "Diario" },
  noche_aprendizajes: { icon: "💡", time: "20:00–20:10", tag: "Diario" },
  noche_planear_manana: { icon: "🎯", time: "20:10–20:20", tag: "Diario" },
  noche_lectura: { icon: "📖", time: "20:20–20:45", tag: "Diario" },
  skincare_ritual: { icon: "🧴", tag: "Ritual coreano" },
  bienestar_batido_manana: { icon: "🥤", time: "7:00", tag: "Ritual de bienestar" },
  bienestar_proteina_manana: { icon: "💪", time: "7:00", tag: "Ritual de bienestar" },
  bienestar_te_manana: { icon: "🍵", time: "7:00", tag: "Ritual de bienestar" },
  bienestar_batido_noche: { icon: "🥤", time: "18:30", tag: "Ritual de bienestar" },
  bienestar_proteina_noche: { icon: "💪", time: "18:30", tag: "Ritual de bienestar" },
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
    steps: [
      "manana_despertar_agua",
      "manana_bano",
      "manana_agradecer_meditar",
      "manana_journal_objetivo",
      "manana_lectura",
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
    steps: ["noche_ducha", "noche_revision_dia", "noche_aprendizajes", "noche_planear_manana", "noche_lectura"],
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
    groups: [
      {
        label: "Ritual de la mañana",
        steps: ["bienestar_batido_manana", "bienestar_proteina_manana", "bienestar_te_manana"],
      },
      {
        label: "Ritual de la noche",
        steps: ["bienestar_batido_noche", "bienestar_proteina_noche"],
      },
    ],
    steps: [
      "bienestar_batido_manana",
      "bienestar_proteina_manana",
      "bienestar_te_manana",
      "bienestar_batido_noche",
      "bienestar_proteina_noche",
    ],
  },
  {
    key: "skincare",
    title: "Skincare (ritual coreano)",
    tips: ["La constancia importa más que la cantidad de pasos."],
    steps: ["skincare_ritual"],
  },
];

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
