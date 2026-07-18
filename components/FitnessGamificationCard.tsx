"use client";

import { ProgressRing } from "@/components/ProgressRing";
import { FitnessData } from "@/lib/useFitnessState";

export function FitnessGamificationCard({
  f,
  onOpenCouple,
  onOpenAchievements,
}: {
  f: FitnessData;
  onOpenCouple: () => void;
  onOpenAchievements: () => void;
}) {
  const xpPct = Math.min(100, (f.xpInLevel / f.xpPerLevel) * 100);

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-4">
        <ProgressRing value={f.xpToday} total={f.dailyGoal} size={84} strokeWidth={9} sublabel="meta diaria" />

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <span className="text-xl font-black leading-none text-zinc-900 dark:text-white">
                {f.couple.coupleStreak}
              </span>
              <span className="ml-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                {f.couple.coupleStreak === 1 ? "día en pareja" : "días en pareja"}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-zinc-900 dark:text-white">Nivel {f.level}</span>
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                {f.xpInLevel}/{f.xpPerLevel} XP
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
        <button
          onClick={onOpenCouple}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <span>💞</span>
          <span className="text-pink-600 dark:text-pink-300">Pareja</span>
        </button>
        <button
          onClick={onOpenAchievements}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <span>🏅</span>
          <span className="text-zinc-800 dark:text-zinc-200">Logros</span>
          <span className="text-zinc-400 dark:text-zinc-500">
            {f.unlocked.length}/{f.totalAchievements}
          </span>
        </button>
        <div
          className="flex items-center justify-center gap-1 rounded-xl bg-sky-100 px-3 py-2.5 text-sm font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
          title="Protectores de racha"
        >
          <span>❄️</span>
          <span>{f.freezes}</span>
        </div>
      </div>
    </div>
  );
}
