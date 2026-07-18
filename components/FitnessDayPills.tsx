"use client";

import { FitnessRoutine, Weekday, WEEKDAYS, WEEKDAY_SHORT } from "@/lib/fitness-types";

export function FitnessDayPills({
  routine,
  selected,
  today,
  onSelect,
}: {
  routine: FitnessRoutine;
  selected: Weekday;
  today: Weekday;
  onSelect: (day: Weekday) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAYS.map((day) => {
        const count = routine[day].length;
        const isSelected = day === selected;
        const isToday = day === today;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 ring-1 transition-colors ${
              isSelected
                ? "bg-orange-50 ring-orange-400 dark:bg-orange-500/15 dark:ring-orange-500"
                : "bg-zinc-50 ring-zinc-200 hover:bg-zinc-100 dark:bg-white/[0.03] dark:ring-white/10 dark:hover:bg-white/[0.06]"
            }`}
          >
            <span
              className={`text-[11px] font-semibold tracking-wide ${
                isSelected ? "text-orange-600 dark:text-orange-300" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {WEEKDAY_SHORT[day]}
            </span>
            <span
              className={`text-xs font-bold ${
                count > 0 ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {count > 0 ? count : "—"}
            </span>
            {isToday && <span className="h-1 w-1 rounded-full bg-orange-500" aria-label="hoy" />}
          </button>
        );
      })}
    </div>
  );
}
