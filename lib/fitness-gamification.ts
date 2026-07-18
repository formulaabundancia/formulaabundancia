import { FitnessIntensity } from "./fitness-types";
import { diffDays } from "./fitness-date";

// ===== XP =====
export const XP_PER_INTENSITY: Record<FitnessIntensity, number> = {
  Suave: 5,
  Media: 8,
  Fuerte: 12,
};

export const XP_PER_LEVEL = 100;
export const DEFAULT_DAILY_GOAL = 30;

export function levelFromXp(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}
export function xpIntoLevel(totalXp: number): number {
  return totalXp % XP_PER_LEVEL;
}

export interface GamiState {
  totalXp: number;
  dailyGoal: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  freezes: number;
  xpByDate: Record<string, number>;
  exercisesCompleted: number;
  unlocked: string[]; // ids de logros
}

export function defaultGami(): GamiState {
  return {
    totalXp: 0,
    dailyGoal: DEFAULT_DAILY_GOAL,
    streak: 0,
    bestStreak: 0,
    lastActiveDate: null,
    freezes: 2,
    xpByDate: {},
    exercisesCompleted: 0,
    unlocked: [],
  };
}

/**
 * Normaliza la racha al día actual (sin celebrar): la rompe o la mantiene
 * según los protectores disponibles si se ha saltado algún día.
 */
export function normalizeGami(state: GamiState, today: string): GamiState {
  if (!state.lastActiveDate) return state;
  const gap = diffDays(state.lastActiveDate, today);
  if (gap <= 1) return state;
  const missed = gap - 1;
  if (state.freezes >= missed) return { ...state, freezes: state.freezes - missed };
  return { ...state, streak: 0 };
}

// ===== Logros =====
export interface AchievementCtx {
  streak: number;
  level: number;
  exercisesCompleted: number;
  maxDayVolume: number;
  weekMuscleGroups: number;
  /** Racha de PAREJA (días consecutivos entrenando los dos), no la individual. */
  coupleStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  test: (c: AchievementCtx) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "primer-entreno", title: "Primer paso", description: "Completa tu primer ejercicio", emoji: "👟", test: (c) => c.exercisesCompleted >= 1 },
  { id: "en-racha", title: "En racha", description: "Racha de 3 días", emoji: "🔥", test: (c) => c.streak >= 3 },
  { id: "semana-fuego", title: "Semana de fuego", description: "Racha de 7 días", emoji: "🔥", test: (c) => c.streak >= 7 },
  { id: "imparable", title: "Imparable", description: "Racha de 30 días", emoji: "⚡", test: (c) => c.streak >= 30 },
  { id: "veterano", title: "Veterano", description: "Alcanza el nivel 5", emoji: "⭐", test: (c) => c.level >= 5 },
  { id: "modo-bestia", title: "Modo bestia", description: "Completa 25 ejercicios", emoji: "💪", test: (c) => c.exercisesCompleted >= 25 },
  { id: "tonelada", title: "Tonelada", description: "1.000 kg de volumen en un día", emoji: "🏋️", test: (c) => c.maxDayVolume >= 1000 },
  { id: "cuerpo-completo", title: "Cuerpo completo", description: "6 grupos musculares en tu semana", emoji: "🎯", test: (c) => c.weekMuscleGroups >= 6 },
  { id: "compenetrados", title: "Compenetrados", description: "Racha de pareja de 14 días", emoji: "💞", test: (c) => c.coupleStreak >= 14 },
];
