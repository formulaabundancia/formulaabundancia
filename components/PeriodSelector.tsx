"use client";

import { PeriodGranularity } from "@/lib/storage";

const GRANULARITY_OPTIONS: { id: PeriodGranularity; label: string }[] = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "quarter", label: "Trimestre" },
  { id: "half", label: "Semestre" },
  { id: "year", label: "Año" },
];

const YEAR_RANGE_OPTIONS = [2, 3, 5, 10];

export function PeriodSelector({
  granularity,
  onGranularityChange,
  yearsRange,
  onYearsRangeChange,
}: {
  granularity: PeriodGranularity;
  onGranularityChange: (g: PeriodGranularity) => void;
  yearsRange: number;
  onYearsRangeChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {GRANULARITY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onGranularityChange(opt.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              granularity === opt.id
                ? "bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {granularity === "year" && (
        <div className="flex gap-1.5">
          {YEAR_RANGE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onYearsRangeChange(n)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                yearsRange === n
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-50 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
              }`}
            >
              {n} años
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
