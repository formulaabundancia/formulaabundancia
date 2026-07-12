import { RitualKey } from "./rituals";
import { Area, Dimension, FinanceScope, HabitKey } from "./types";

export type BlockConfig =
  | { kind: "habit"; habitKey: HabitKey }
  | { kind: "meals" }
  | { kind: "finance"; scope: FinanceScope; title?: string }
  | { kind: "networth" }
  | { kind: "ritual"; ritualKey: RitualKey }
  | { kind: "dynamic-habits"; area: Area; dimension: Dimension }
  | { kind: "personal-content"; mode: "decretos" | "visualizacion" }
  | {
      kind: "log";
      blockKey: string;
      title: string;
      categorias: string[];
      trackMonto?: boolean;
      placeholder?: string;
    }
  | { kind: "list"; blockKey: string; title: string; allowAssign?: boolean; itemLabel?: string };

export interface SectionConfig {
  area: Area;
  dimension: Dimension;
  title: string;
  subtitle: string;
  blocks: BlockConfig[];
}

export const AREAS: { id: Area; label: string; accent: string; icon: string }[] = [
  { id: "salud", label: "Salud", accent: "emerald", icon: "🌿" },
  { id: "dinero", label: "Dinero", accent: "amber", icon: "💰" },
  { id: "amor", label: "Amor", accent: "rose", icon: "❤️" },
];

export const DIMENSIONS: { id: Dimension; label: string; icon: string }[] = [
  { id: "cuerpo", label: "Cuerpo", icon: "💪" },
  { id: "alma", label: "Alma", icon: "✨" },
  { id: "mente", label: "Mente", icon: "🧠" },
  { id: "espiritu", label: "Espíritu", icon: "🕊️" },
];

export const SECTIONS: SectionConfig[] = [
  {
    area: "salud",
    dimension: "cuerpo",
    title: "Salud · Cuerpo",
    subtitle: "Vitalidad y energía diaria",
    blocks: [
      { kind: "habit", habitKey: "deporte" },
      { kind: "habit", habitKey: "agua" },
      { kind: "meals" },
      { kind: "dynamic-habits", area: "salud", dimension: "cuerpo" },
    ],
  },
  {
    area: "salud",
    dimension: "alma",
    title: "Salud · Alma",
    subtitle: "Gratitud, calma y alegría",
    blocks: [
      { kind: "personal-content", mode: "decretos" },
      { kind: "dynamic-habits", area: "salud", dimension: "alma" },
    ],
  },
  {
    area: "salud",
    dimension: "mente",
    title: "Salud · Mente",
    subtitle: "Ver claro sin límites",
    blocks: [{ kind: "dynamic-habits", area: "salud", dimension: "mente" }],
  },
  {
    area: "salud",
    dimension: "espiritu",
    title: "Salud · Espíritu",
    subtitle: "Agradezco mi cuerpo",
    blocks: [
      { kind: "personal-content", mode: "visualizacion" },
      { kind: "dynamic-habits", area: "salud", dimension: "espiritu" },
    ],
  },
  {
    area: "dinero",
    dimension: "cuerpo",
    title: "Dinero · Cuerpo",
    subtitle: "Casa nueva, viajes y libertad",
    blocks: [{ kind: "networth" }],
  },
  {
    area: "dinero",
    dimension: "alma",
    title: "Dinero · Alma",
    subtitle: "Riqueza con gratitud y generosidad",
    blocks: [
      {
        kind: "log",
        blockKey: "dinero-alma",
        title: "Mentalidad y generosidad",
        categorias: ["Mentalidad", "Generosidad"],
        trackMonto: true,
        placeholder: "Una creencia, un miedo, una donación...",
      },
    ],
  },
  {
    area: "dinero",
    dimension: "mente",
    title: "Dinero · Mente",
    subtitle: "100K IA, 70K bolsa, 10K infoproductos",
    blocks: [{ kind: "finance", scope: "pareja", title: "Balance de pareja" }],
  },
  {
    area: "dinero",
    dimension: "espiritu",
    title: "Dinero · Espíritu",
    subtitle: "Vibro en abundancia",
    blocks: [
      {
        kind: "log",
        blockKey: "dinero-espiritu",
        title: "Visión y gratitud",
        categorias: ["Visión", "Gratitud"],
      },
    ],
  },
  {
    area: "amor",
    dimension: "cuerpo",
    title: "Amor · Cuerpo",
    subtitle: "Energía, pasión y viajes juntos",
    blocks: [
      {
        kind: "log",
        blockKey: "amor-cuerpo",
        title: "Intimidad y cuidado físico",
        categorias: ["Intimidad", "Chequeo"],
      },
    ],
  },
  {
    area: "amor",
    dimension: "alma",
    title: "Amor · Alma",
    subtitle: "Apoyo y complicidad",
    blocks: [
      {
        kind: "log",
        blockKey: "amor-alma",
        title: "Conexión emocional",
        categorias: ["Check-in", "Crecimiento"],
      },
    ],
  },
  {
    area: "amor",
    dimension: "mente",
    title: "Amor · Mente",
    subtitle: "Comunicación y calidad",
    blocks: [
      {
        kind: "log",
        blockKey: "amor-mente",
        title: "Comunicación y proyectos",
        categorias: ["Comunicación", "Proyectos"],
      },
    ],
  },
  {
    area: "amor",
    dimension: "espiritu",
    title: "Amor · Espíritu",
    subtitle: "Crecemos espiritualmente en la naturaleza",
    blocks: [
      {
        kind: "log",
        blockKey: "amor-espiritu",
        title: "Rituales y espiritualidad",
        categorias: ["Rituales", "Espiritualidad"],
      },
    ],
  },
];

export const DYLAN_BLOCKS: { title: string; block: BlockConfig }[] = [
  { title: "Fondo de Dylan", block: { kind: "finance", scope: "dylan", title: "Fondo de Dylan" } },
  { title: "Tiempo de juego diario", block: { kind: "habit", habitKey: "juego_dylan" } },
  {
    title: "Ocio y salidas en familia",
    block: {
      kind: "list",
      blockKey: "dylan-ocio",
      title: "Ocio y salidas en familia",
      allowAssign: true,
      itemLabel: "Ej: ir al parque el sábado",
    },
  },
  {
    title: "Aprendizaje y lectura",
    block: {
      kind: "log",
      blockKey: "dylan-aprendizaje",
      title: "Aprendizaje y lectura",
      categorias: ["Aprendizaje"],
      placeholder: "Cuento, deberes, algo nuevo que aprendió...",
    },
  },
  {
    title: "Rutina de Dylan",
    block: {
      kind: "list",
      blockKey: "dylan-rutina",
      title: "Rutina de Dylan",
      allowAssign: true,
      itemLabel: "Ej: rutina de la noche",
    },
  },
  {
    title: "Salud de Dylan",
    block: {
      kind: "log",
      blockKey: "dylan-salud",
      title: "Salud de Dylan",
      categorias: ["Cita médica", "Vacuna", "Seguimiento"],
    },
  },
  {
    title: "Momentos especiales",
    block: {
      kind: "log",
      blockKey: "dylan-momentos",
      title: "Momentos especiales",
      categorias: ["Recuerdo"],
      placeholder: "Algo gracioso que dijo, un hito, una foto que guardar...",
    },
  },
];

export function getSection(area: string, dimension: string): SectionConfig | undefined {
  return SECTIONS.find((s) => s.area === area && s.dimension === dimension);
}

// Claves de hábito que ya aparecen en un bloque fijo (tarjeta suelta o bloque
// de Dylan) — se usan para que "dynamic-habits" no las muestre duplicadas. Los
// pasos de ritual se excluyen aparte por su propio campo `ritualKey` (ver
// DynamicHabits.tsx), ya que ahora son datos y no un array estático.
export function getExplicitlyPlacedHabitKeys(): Set<string> {
  const keys = new Set<string>();
  const collect = (blocks: BlockConfig[]) => {
    for (const b of blocks) {
      if (b.kind === "habit") keys.add(b.habitKey);
    }
  };
  SECTIONS.forEach((s) => collect(s.blocks));
  collect(DYLAN_BLOCKS.map((d) => d.block));
  return keys;
}
