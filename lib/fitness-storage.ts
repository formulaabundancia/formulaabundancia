"use client";

import { getAllExercises, upsertExercise } from "./storage";
import { ProfileId } from "./types";
import { FITNESS_TIPO, FitnessState } from "./fitness-state";

/**
 * Capa de datos de Entreno. Reutiliza la tabla genérica `exercises`
 * (owner_id + tipo + data jsonb) que ya usa el programa de pareja — no hace
 * falta ninguna tabla ni migración nueva. Un registro por persona; su pareja
 * lo puede leer porque se guarda con visibility "shared".
 */
export async function getAllFitnessStates() {
  return getAllExercises<FitnessState>(FITNESS_TIPO);
}

export async function saveFitnessState(profileId: ProfileId, state: FitnessState): Promise<void> {
  await upsertExercise<FitnessState>(FITNESS_TIPO, state, profileId);
}
