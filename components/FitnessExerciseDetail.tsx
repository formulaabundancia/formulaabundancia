"use client";

import { MuscleGroup } from "@/lib/fitness-types";
import { FitnessMuscleGroupBadge } from "./FitnessMuscleGroupBadge";

/** Modal con el GIF animado grande, el equipo y las instrucciones paso a paso. */
export function FitnessExerciseDetail({
  name,
  muscleGroup,
  equipment,
  gif,
  image,
  steps,
  actionLabel,
  onAction,
  onClose,
}: {
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  gif?: string;
  image?: string;
  steps?: string[];
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}) {
  const media = gif ?? image;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <div>
            <h2 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50">{name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <FitnessMuscleGroupBadge group={muscleGroup} />
              {equipment && <span className="text-xs text-zinc-500 dark:text-zinc-400">· {equipment}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {media && (
            <div className="mb-4 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt={name} className="mx-auto h-56 w-full max-w-xs object-contain" />
            </div>
          )}

          {steps && steps.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-bold tracking-wide text-zinc-500 dark:text-zinc-400">Cómo se hace</h3>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin instrucciones para este ejercicio.</p>
          )}
        </div>

        {actionLabel && onAction && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <button
              onClick={onAction}
              className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
