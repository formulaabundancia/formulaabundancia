"use client";

import { useMemo } from "react";
import { MuscleGroup, FitnessRoutine, volumeOfSets } from "@/lib/fitness-types";
import { MUSCLE_BAR_COLOR } from "./FitnessMuscleGroupBadge";

export function FitnessWeeklyBalance({ routine }: { routine: FitnessRoutine }) {
  const byGroup = useMemo(() => {
    const totals = new Map<MuscleGroup, number>();
    Object.values(routine).forEach((day) => {
      day.forEach((ex) => {
        const vol = volumeOfSets(ex.sets);
        if (vol <= 0) return;
        totals.set(ex.muscleGroup, (totals.get(ex.muscleGroup) ?? 0) + vol);
      });
    });
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [routine]);

  const max = byGroup.length > 0 ? byGroup[0][1] : 0;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest text-zinc-700 dark:text-zinc-300">BALANCE SEMANAL</h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Volumen por grupo muscular</span>
      </div>

      {byGroup.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Aún no hay volumen registrado. Añade ejercicios con peso para ver tu balance.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {byGroup.map(([group, vol]) => (
            <li key={group} className="flex items-center gap-3">
              <span className="w-16 flex-shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{group}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
                <div
                  className={`h-full rounded-full ${MUSCLE_BAR_COLOR[group]}`}
                  style={{ width: `${max > 0 ? (vol / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-16 flex-shrink-0 text-right text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {vol.toLocaleString("es-ES")} kg
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
