"use client";

import { ACHIEVEMENTS } from "@/lib/fitness-gamification";
import { FitnessData } from "@/lib/useFitnessState";

export function FitnessAchievementsModal({ f, onClose }: { f: FitnessData; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 pb-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Logros</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {f.unlocked.length} de {f.totalAchievements} desbloqueados
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = f.unlocked.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl p-3 ring-1 ${
                    unlocked
                      ? "bg-orange-50 ring-orange-200 dark:bg-orange-500/[0.08] dark:ring-orange-500/30"
                      : "bg-zinc-50 ring-zinc-200 dark:bg-white/[0.02] dark:ring-white/10"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`text-xl ${unlocked ? "" : "opacity-40 grayscale"}`}>
                      {unlocked ? a.emoji : "🔒"}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        unlocked ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {a.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
