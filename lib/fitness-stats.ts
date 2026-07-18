import { MuscleGroup, FitnessRoutine, WEEKDAYS } from "./fitness-types";
import { addDaysIso } from "./fitness-date";
import { todayStr } from "./storage";

export interface FlatSet {
  date: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
}

/** Aplana todas las series de la rutina (de todos los días) en una sola lista. */
export function flattenSets(routine: FitnessRoutine): FlatSet[] {
  const out: FlatSet[] = [];
  WEEKDAYS.forEach((day) => {
    routine[day].forEach((ex) => {
      ex.sets.forEach((s) => {
        out.push({
          date: s.date,
          exerciseId: ex.exerciseId,
          exerciseName: ex.name,
          muscleGroup: ex.muscleGroup,
          weight: s.weight,
          reps: s.reps,
        });
      });
    });
  });
  return out;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  maxWeight: number;
  repsAtMax: number;
  date: string;
}

/** Mejor marca (peso máximo) por ejercicio, a partir de todo el histórico. */
export function personalRecords(routine: FitnessRoutine): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  flattenSets(routine).forEach((s) => {
    if (s.weight <= 0) return;
    const current = best.get(s.exerciseId);
    if (!current || s.weight > current.maxWeight) {
      best.set(s.exerciseId, {
        exerciseId: s.exerciseId,
        exerciseName: s.exerciseName,
        muscleGroup: s.muscleGroup,
        maxWeight: s.weight,
        repsAtMax: s.reps,
        date: s.date,
      });
    }
  });
  return Array.from(best.values()).sort((a, b) => b.maxWeight - a.maxWeight);
}

export interface DayVolume {
  date: string;
  volume: number;
}

/** Volumen (kg) por día de los últimos `days` días, incluyendo hoy y ceros. */
export function volumeByDay(routine: FitnessRoutine, days: number): DayVolume[] {
  const totals = new Map<string, number>();
  flattenSets(routine).forEach((s) => {
    totals.set(s.date, (totals.get(s.date) ?? 0) + s.weight * s.reps);
  });
  const today = todayStr();
  const result: DayVolume[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysIso(today, -i);
    result.push({ date, volume: totals.get(date) ?? 0 });
  }
  return result;
}

export interface StatsSummary {
  totalWorkoutDays: number;
  totalVolume: number;
  totalSets: number;
}

/** Resumen global: días distintos entrenados, volumen y series totales. */
export function summarize(routine: FitnessRoutine): StatsSummary {
  const sets = flattenSets(routine);
  const days = new Set(sets.map((s) => s.date));
  return {
    totalWorkoutDays: days.size,
    totalVolume: sets.reduce((n, s) => n + s.weight * s.reps, 0),
    totalSets: sets.length,
  };
}
