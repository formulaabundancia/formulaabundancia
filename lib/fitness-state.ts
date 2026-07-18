import { emptyFitnessRoutine, FitnessExercise, FitnessRoutine } from "./fitness-types";
import { defaultGami, GamiState } from "./fitness-gamification";
import { BodyWeightEntry, DailyWellness } from "./fitness-wellness";

/**
 * Todo el estado de Entreno de UNA persona, guardado como un único registro
 * en la tabla genérica `exercises` (tipo = "entreno", owner_id = su perfil,
 * visibility = "shared" para que su pareja pueda ver su progreso).
 */
export interface FitnessState {
  routine: FitnessRoutine;
  gami: GamiState;
  bodyWeightLog: BodyWeightEntry[];
  wellnessLog: Record<string, DailyWellness>; // indexado por fecha ISO
  customExercises: FitnessExercise[];
}

export function defaultFitnessState(): FitnessState {
  return {
    routine: emptyFitnessRoutine(),
    gami: defaultGami(),
    bodyWeightLog: [],
    wellnessLog: {},
    customExercises: [],
  };
}

/** Tipo usado en la tabla genérica `exercises` para Entreno. */
export const FITNESS_TIPO = "entreno";

/** Rellena claves que falten (defensivo ante datos parciales/antiguos). */
export function hydrateFitnessState(raw: Partial<FitnessState> | null | undefined): FitnessState {
  const base = defaultFitnessState();
  if (!raw) return base;
  return {
    routine: raw.routine ?? base.routine,
    gami: { ...base.gami, ...raw.gami },
    bodyWeightLog: raw.bodyWeightLog ?? base.bodyWeightLog,
    wellnessLog: raw.wellnessLog ?? base.wellnessLog,
    customExercises: raw.customExercises ?? base.customExercises,
  };
}
