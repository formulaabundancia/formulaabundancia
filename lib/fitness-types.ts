export const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** Abreviatura de 3 letras para las pastillas de días. */
export const WEEKDAY_SHORT: Record<Weekday, string> = {
  Lunes: "LUN",
  Martes: "MAR",
  Miércoles: "MIÉ",
  Jueves: "JUE",
  Viernes: "VIE",
  Sábado: "SÁB",
  Domingo: "DOM",
};

export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Glúteos",
  "Core",
  "Cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/**
 * Ejercicio del catálogo de Entreno. Se llama "FitnessExercise" (no "Exercise",
 * que ya está reservado en lib/types.ts para el registro genérico del programa
 * de pareja) para no chocar de nombre.
 */
export interface FitnessExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  /** Equipo necesario, en español (ej. "Barra", "Mancuernas"). */
  equipment?: string;
  /** URL de la foto/miniatura del ejercicio. */
  image?: string;
  /** URL del GIF animado del movimiento. */
  gif?: string;
  /** Instrucciones paso a paso en español. */
  steps?: string[];
}

/** Intensidad percibida, en lenguaje sencillo. */
export const INTENSITIES = ["Suave", "Media", "Fuerte"] as const;
export type FitnessIntensity = (typeof INTENSITIES)[number];

export interface FitnessSetEntry {
  id: string;
  weight: number;
  reps: number;
  intensity: FitnessIntensity;
  /** Fecha ISO (yyyy-mm-dd) en la que se registró, para progreso/estadísticas. */
  date: string;
}

/** Un ejercicio dentro del día de la semana, con sus series registradas. */
export interface FitnessDayExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: FitnessSetEntry[];
  done: boolean;
  /** Media e instrucciones copiadas del catálogo al añadir (opcionales). */
  equipment?: string;
  image?: string;
  gif?: string;
  steps?: string[];
}

export type FitnessRoutine = Record<Weekday, FitnessDayExercise[]>;

export function emptyFitnessRoutine(): FitnessRoutine {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as FitnessRoutine);
}

/** Volumen total (kg movidos) de una lista de series. */
export function volumeOfSets(sets: FitnessSetEntry[]): number {
  return sets.reduce((total, s) => total + s.weight * s.reps, 0);
}

export function volumeOfExercise(ex: FitnessDayExercise): number {
  return volumeOfSets(ex.sets);
}

export function newFitnessId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
