export type RitualKey = "manana" | "noche" | "skincare";

export interface RitualConfig {
  key: RitualKey;
  title: string;
  tip: string;
  steps: string[]; // habit keys, en orden
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
  skincare_limpieza: { icon: "🧼", tag: "Diario" },
  skincare_tonico: { icon: "💧", tag: "Diario" },
  skincare_serum: { icon: "✨", tag: "Diario" },
  skincare_hidratante: { icon: "🧴", tag: "Diario" },
  skincare_spf: { icon: "☀️", tag: "Diario" },
};

export const RITUALS: RitualConfig[] = [
  {
    key: "manana",
    title: "Ritual de mañana",
    tip: "Cada mañana que te levantas temprano cuando el mundo duerme, estás ganando ventaja real.",
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
    tip: "Revisa tu día con amabilidad — lo que aprendes hoy es el cimiento de mañana.",
    steps: ["noche_ducha", "noche_revision_dia", "noche_aprendizajes", "noche_planear_manana", "noche_lectura"],
  },
  {
    key: "skincare",
    title: "Skincare (ritual coreano)",
    tip: "La constancia importa más que la cantidad de pasos.",
    steps: ["skincare_limpieza", "skincare_tonico", "skincare_serum", "skincare_hidratante", "skincare_spf"],
  },
];

export function getRitual(key: RitualKey): RitualConfig {
  const ritual = RITUALS.find((r) => r.key === key);
  if (!ritual) throw new Error(`Ritual desconocido: ${key}`);
  return ritual;
}
