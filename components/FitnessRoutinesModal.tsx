"use client";

import { GUIDED_ROUTINES, GuidedRoutine } from "@/lib/fitness-routines";
import { WEEKDAY_SHORT, Weekday } from "@/lib/fitness-types";

export function FitnessRoutinesModal({
  onApply,
  onClose,
}: {
  onApply: (template: GuidedRoutine) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Rutinas guiadas</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Fáciles, en casa. Elige una y os montamos la semana.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {GUIDED_ROUTINES.map((r) => {
            const days = Object.keys(r.days) as Weekday[];
            const total = days.reduce((n, d) => n + (r.days[d]?.length ?? 0), 0);
            return (
              <div
                key={r.id}
                className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{r.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                        {r.level}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{r.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {days.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-300"
                        >
                          {WEEKDAY_SHORT[d]}
                        </span>
                      ))}
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">· {total} ejercicios</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onApply(r)}
                  className="mt-3 w-full rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white"
                >
                  Usar esta rutina
                </button>
              </div>
            );
          })}
          <p className="pt-1 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
            Aplicar una rutina reemplaza tu semana actual.
          </p>
        </div>
      </div>
    </div>
  );
}
