"use client";

import { PROTEIN_GOAL_G, PROTEIN_STEP_G, WATER_GOAL_CUPS } from "@/lib/fitness-wellness";
import { FitnessData } from "@/lib/useFitnessState";

export function FitnessWellnessCard({ f }: { f: FitnessData }) {
  const { water, protein } = f.wellness;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* Agua */}
      <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-zinc-900">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-sky-600 dark:text-sky-300">💧 Agua</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {water}/{WATER_GOAL_CUPS}
          </span>
        </div>
        <div className="mb-2 flex gap-1">
          {Array.from({ length: WATER_GOAL_CUPS }, (_, i) => (
            <span
              key={i}
              className={`h-4 flex-1 rounded-sm ${i < water ? "bg-sky-400" : "bg-zinc-100 dark:bg-white/10"}`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => f.addWater(-1)}
            disabled={water === 0}
            className="flex-1 rounded-lg bg-zinc-100 py-1.5 text-sm font-bold text-zinc-600 disabled:opacity-30 dark:bg-white/5 dark:text-zinc-300"
          >
            −
          </button>
          <button
            onClick={() => f.addWater(1)}
            className="flex-1 rounded-lg bg-sky-100 py-1.5 text-sm font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
          >
            + vaso
          </button>
        </div>
      </div>

      {/* Proteína */}
      <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-zinc-900">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">🥩 Proteína</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {protein}/{PROTEIN_GOAL_G}g
          </span>
        </div>
        <div className="mb-2 h-4 w-full overflow-hidden rounded-sm bg-zinc-100 dark:bg-white/10">
          <div
            className="h-full rounded-sm bg-amber-400 transition-[width] duration-300"
            style={{ width: `${Math.min(100, (protein / PROTEIN_GOAL_G) * 100)}%` }}
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => f.addProtein(-PROTEIN_STEP_G)}
            disabled={protein === 0}
            className="flex-1 rounded-lg bg-zinc-100 py-1.5 text-sm font-bold text-zinc-600 disabled:opacity-30 dark:bg-white/5 dark:text-zinc-300"
          >
            −
          </button>
          <button
            onClick={() => f.addProtein(PROTEIN_STEP_G)}
            className="flex-1 rounded-lg bg-amber-100 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
          >
            +{PROTEIN_STEP_G}g
          </button>
        </div>
      </div>
    </div>
  );
}
