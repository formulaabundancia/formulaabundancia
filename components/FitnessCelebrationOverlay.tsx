"use client";

import { useEffect } from "react";
import { Celebration } from "@/lib/useFitnessState";
import { FitnessConfetti } from "./FitnessConfetti";

export function FitnessCelebrationOverlay({
  celebration,
  onDismiss,
}: {
  celebration: Celebration;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [celebration.key, onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <FitnessConfetti />
      <div className="mx-6 flex flex-col items-center rounded-3xl bg-white px-8 py-8 text-center ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
        <div className="mb-3 text-6xl">{celebration.emoji}</div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{celebration.title}</h2>
        <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{celebration.subtitle}</p>
        <button
          onClick={onDismiss}
          className="mt-5 rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
