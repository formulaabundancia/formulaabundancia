import { MuscleGroup } from "@/lib/fitness-types";

const COLORS: Record<MuscleGroup, string> = {
  Pecho: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
  Espalda: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
  Hombros: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  Bíceps: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
  Tríceps: "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:ring-fuchsia-500/30",
  Piernas: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  Glúteos: "bg-pink-100 text-pink-700 ring-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-500/30",
  Core: "bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30",
  Cardio: "bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-500/30",
};

export function FitnessMuscleGroupBadge({ group }: { group: MuscleGroup }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${COLORS[group]}`}
    >
      {group}
    </span>
  );
}

/** Color sólido para las barras del balance semanal. */
export const MUSCLE_BAR_COLOR: Record<MuscleGroup, string> = {
  Pecho: "bg-rose-500",
  Espalda: "bg-sky-500",
  Hombros: "bg-amber-500",
  Bíceps: "bg-violet-500",
  Tríceps: "bg-fuchsia-500",
  Piernas: "bg-emerald-500",
  Glúteos: "bg-pink-500",
  Core: "bg-orange-500",
  Cardio: "bg-cyan-500",
};
