import { Habit } from "./types";

// Hábitos activos: 3 sueltos + los pasos de los 4 rituales (mañana, noche, bienestar, skincare).
// Los pasos de ritual son hábitos normales por debajo — RitualBlock solo los agrupa
// visualmente y reutiliza el mismo streak/XP que cualquier otro hábito.
export const DEFAULT_HABITS: Habit[] = [
  { key: "deporte", label: "Deporte", area: "salud", dimension: "cuerpo", status: "active" },
  {
    key: "agua",
    label: "Agua (alcalina)",
    area: "salud",
    dimension: "cuerpo",
    status: "active",
    multiCheck: true,
    metaDiaria: 8,
  },
  { key: "juego_dylan", label: "Tiempo de juego con Dylan", area: "salud", dimension: "cuerpo", status: "active" },

  // Ritual de mañana
  { key: "manana_despertar_agua", label: "Despertar + agua + sin móvil", area: "salud", dimension: "alma", status: "active" },
  { key: "manana_bano", label: "Baño/ducha + dientes", area: "salud", dimension: "alma", status: "active" },
  { key: "manana_agradecer_meditar", label: "Agradecer + afirmaciones + meditación", area: "salud", dimension: "alma", status: "active" },
  { key: "manana_journal_objetivo", label: "Journaling + objetivo del día", area: "salud", dimension: "alma", status: "active" },
  { key: "manana_lectura", label: "Lectura — 30 min", area: "salud", dimension: "alma", status: "active" },

  // Ritual de noche
  { key: "noche_ducha", label: "Ducha nocturna + higiene", area: "salud", dimension: "espiritu", status: "active" },
  { key: "noche_revision_dia", label: "Revisión del día", area: "salud", dimension: "espiritu", status: "active" },
  { key: "noche_aprendizajes", label: "3 cosas que aprendí hoy", area: "salud", dimension: "espiritu", status: "active" },
  { key: "noche_planear_manana", label: "Planear mañana", area: "salud", dimension: "espiritu", status: "active" },
  { key: "noche_lectura", label: "Lectura relajante", area: "salud", dimension: "espiritu", status: "active" },

  // Ritual de skincare (K-beauty) — un solo paso, sin desglose de productos
  { key: "skincare_ritual", label: "Ritual coreano", area: "salud", dimension: "cuerpo", status: "active" },

  // Ritual de bienestar (Herbalife) — mañana: batido + proteína + té; noche: batido + proteína
  { key: "bienestar_batido_manana", label: "Batido Herbalife (chocolate)", area: "salud", dimension: "cuerpo", status: "active" },
  { key: "bienestar_proteina_manana", label: "Proteína", area: "salud", dimension: "cuerpo", status: "active" },
  { key: "bienestar_te_manana", label: "Té", area: "salud", dimension: "cuerpo", status: "active" },
  { key: "bienestar_batido_noche", label: "Batido Herbalife (chocolate)", area: "salud", dimension: "cuerpo", status: "active" },
  { key: "bienestar_proteina_noche", label: "Proteína", area: "salud", dimension: "cuerpo", status: "active" },

  // Librería de hábitos sugeridos (de las notas de Jose) — status "suggested",
  // se activan desde /libreria.
  { key: "wc", label: "WC (rutina digestiva matutina)", area: "salud", dimension: "cuerpo", status: "suggested" },
  { key: "dientes_mano_izquierda", label: "Dientes con la mano izquierda", area: "salud", dimension: "cuerpo", status: "suggested" },
  { key: "vaso_limon", label: "Vaso de limón", area: "salud", dimension: "cuerpo", status: "suggested" },
  { key: "desayunar", label: "Desayunar con consciencia", area: "salud", dimension: "cuerpo", status: "suggested" },
  { key: "energia_tony_robbins", label: "Subir la energía (Tony Robbins)", area: "salud", dimension: "alma", status: "suggested" },
  { key: "estudiar_desarrollo", label: "Estudiar desarrollo personal", area: "salud", dimension: "mente", status: "suggested" },
];
