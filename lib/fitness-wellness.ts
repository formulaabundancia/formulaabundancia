export interface BodyWeightEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  weight: number; // kg
}

/** Vasos de agua (250ml) y gramos de proteína registrados en un día. */
export interface DailyWellness {
  water: number;
  protein: number;
}

export const WATER_GOAL_CUPS = 8; // 8 vasos ≈ 2L
export const PROTEIN_GOAL_G = 120;
export const PROTEIN_STEP_G = 20;
