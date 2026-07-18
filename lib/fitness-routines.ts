import { DEFAULT_EXERCISES } from "./fitness-exercise-library";
import {
  FitnessDayExercise,
  FitnessExercise,
  FitnessRoutine,
  Weekday,
  emptyFitnessRoutine,
  newFitnessId,
} from "./fitness-types";

/** Equipo considerado "de casa" (sin gimnasio). */
export const HOME_EQUIPMENT = new Set([
  "Peso corporal",
  "Banda elástica",
  "Mancuernas",
  "Kettlebell",
  "Fitball",
  "Balón medicinal",
  "Bosu",
  "Con peso",
]);

export function isHomeFriendly(ex: FitnessExercise): boolean {
  return !ex.equipment || HOME_EQUIPMENT.has(ex.equipment);
}

export interface GuidedRoutine {
  id: string;
  name: string;
  emoji: string;
  level: "Principiante" | "Intermedio";
  description: string;
  /** Días → ids de ejercicios del catálogo. */
  days: Partial<Record<Weekday, string[]>>;
}

/**
 * Rutinas guiadas fáciles para entrenar en casa (peso corporal). Resuelven el
 * "no sé qué hacer": al aplicarlas, montan la semana entera.
 */
export const GUIDED_ROUTINES: GuidedRoutine[] = [
  {
    id: "full-body-casa",
    name: "Full body fácil en casa",
    emoji: "🏠",
    level: "Principiante",
    description: "3 días · cuerpo completo con tu propio peso. Ideal para empezar.",
    days: {
      Lunes: ["flexiones-inclinadas", "puente-de-gluteo", "plancha-abdominal", "jumping-jacks-salto-de-tijera"],
      Miércoles: ["flexiones", "abduccion-de-cadera-de-pie", "crunch-abdominal", "escaladores-mountain-climbers"],
      Viernes: ["flexiones-diamante", "puente-de-gluteo", "giro-ruso-russian-twist", "burpees"],
    },
  },
  {
    id: "core-abdomen-casa",
    name: "Core y abdomen en casa",
    emoji: "🎯",
    level: "Principiante",
    description: "2 días · abdomen y estabilidad, sin material.",
    days: {
      Lunes: ["plancha-abdominal", "crunch-abdominal", "giro-ruso-russian-twist", "elevacion-de-piernas-tumbado"],
      Jueves: ["plancha-lateral", "crunch-inverso", "bicicleta-abdominal", "escaladores-mountain-climbers"],
    },
  },
  {
    id: "cardio-quema-casa",
    name: "Cardio quema en casa",
    emoji: "🔥",
    level: "Principiante",
    description: "2 días · sube pulsaciones y quema, solo peso corporal.",
    days: {
      Martes: ["jumping-jacks-salto-de-tijera", "escaladores-mountain-climbers", "burpees", "plancha-con-toque-de-hombro"],
      Sábado: ["burpees", "jumping-jacks-salto-de-tijera", "escaladores-mountain-climbers", "giro-ruso-russian-twist"],
    },
  },
];

function toDayExercise(ex: FitnessExercise): FitnessDayExercise {
  return {
    id: newFitnessId(),
    exerciseId: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    sets: [],
    done: false,
    equipment: ex.equipment,
    image: ex.image,
    gif: ex.gif,
    steps: ex.steps,
  };
}

/** Construye una FitnessRoutine completa a partir de una rutina guiada. */
export function buildRoutine(template: GuidedRoutine): FitnessRoutine {
  const byId = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));
  const routine = emptyFitnessRoutine();
  (Object.keys(template.days) as Weekday[]).forEach((day) => {
    const ids = template.days[day] ?? [];
    routine[day] = ids
      .map((id) => byId.get(id))
      .filter((e): e is FitnessExercise => Boolean(e))
      .map(toDayExercise);
  });
  return routine;
}
