export type RitualKey = "manana" | "noche" | "skincare";

export interface RitualConfig {
  key: RitualKey;
  title: string;
  steps: string[]; // habit keys, en orden
}

export const RITUALS: RitualConfig[] = [
  {
    key: "manana",
    title: "Ritual de mañana",
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
    steps: ["noche_ducha", "noche_revision_dia", "noche_aprendizajes", "noche_planear_manana", "noche_lectura"],
  },
  {
    key: "skincare",
    title: "Skincare (ritual coreano)",
    steps: ["skincare_limpieza", "skincare_tonico", "skincare_serum", "skincare_hidratante", "skincare_spf"],
  },
];

export function getRitual(key: RitualKey): RitualConfig {
  const ritual = RITUALS.find((r) => r.key === key);
  if (!ritual) throw new Error(`Ritual desconocido: ${key}`);
  return ritual;
}
