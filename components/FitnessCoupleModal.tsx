"use client";

import { useEffect } from "react";
import { PROFILE_AVATAR_COLOR, PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { FitnessData } from "@/lib/useFitnessState";
import { ProgressRing } from "@/components/ProgressRing";

export function FitnessCoupleModal({ f, onClose }: { f: FitnessData; onClose: () => void }) {
  // Al abrir, refresca los datos de la pareja para que no salgan desfasados.
  useEffect(() => {
    f.refetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { couple } = f;

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">En pareja 💞</h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-5 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
          <ProgressRing value={couple.coupleXpToday} total={couple.coupleGoal} size={96} strokeWidth={9} sublabel="meta pareja" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔥</span>
              <div>
                <div className="text-2xl font-black leading-none text-zinc-900 dark:text-white">
                  {couple.coupleStreak}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {couple.coupleStreak === 1 ? "día en pareja" : "días en pareja"}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              La racha sube solo si entrenáis <span className="text-zinc-700 dark:text-zinc-300">los dos</span> el mismo día.
            </p>
          </div>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-bold tracking-wide text-zinc-500 dark:text-zinc-400">Hoy</h3>
        <ul className="space-y-2">
          {couple.members.map((m) => (
            <li
              key={m.profile.id}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${PROFILE_AVATAR_COLOR[m.profile.name]}`}
              >
                {PROFILE_DISPLAY_NAMES[m.profile.name][0]}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {PROFILE_DISPLAY_NAMES[m.profile.name]}
                  {m.isMe && <span className="ml-1 text-xs font-normal text-zinc-400">(tú)</span>}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Nivel {m.level} · racha {m.streak} 🔥
                </div>
              </div>
              {m.trainedToday ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                  ✓ {m.xpToday} XP
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10">
                  ⏳ pendiente
                </span>
              )}
            </li>
          ))}
        </ul>

        {couple.bothTrainedToday && (
          <p className="mt-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-300">
            ¡Los dos habéis entrenado hoy! 💪 Racha a salvo.
          </p>
        )}
      </div>
    </div>
  );
}
