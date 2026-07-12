"use client";

import { TrendDownIcon, TrendUpIcon } from "@/components/icons";

export function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (current === previous) {
    if (current === 0) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Igual
      </span>
    );
  }

  const isUp = current > previous;
  const pct = previous > 0 ? Math.round((Math.abs(current - previous) / previous) * 100) : null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isUp
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
      }`}
    >
      {isUp ? <TrendUpIcon className="h-3.5 w-3.5" /> : <TrendDownIcon className="h-3.5 w-3.5" />}
      {pct !== null ? `${pct}%` : "nuevo"}
    </span>
  );
}
