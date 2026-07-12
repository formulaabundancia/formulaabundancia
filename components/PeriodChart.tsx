"use client";

import { useState } from "react";
import { PeriodBucket } from "@/lib/storage";
import { ProgressRing } from "@/components/ProgressRing";
import { TrendBadge } from "@/components/TrendBadge";
import { BarsIcon, DonutIcon } from "@/components/icons";

export function PeriodChart({ buckets, circleTotal }: { buckets: PeriodBucket[]; circleTotal: number }) {
  const [mode, setMode] = useState<"bar" | "circle">("bar");
  const last = buckets[buckets.length - 1];
  const prev = buckets[buckets.length - 2];
  const max = Math.max(1, ...buckets.map((b) => b.value));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div>{last && prev && <TrendBadge current={last.value} previous={prev.value} />}</div>
        <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setMode("bar")}
            aria-label="Ver en barras"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
              mode === "bar"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <BarsIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("circle")}
            aria-label="Ver en círculo"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
              mode === "circle"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <DonutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mode === "bar" ? (
        <>
          <div className="mt-4 flex items-end gap-1.5" style={{ height: 90 }}>
            {buckets.map((b) => (
              <div
                key={b.bucket}
                className="flex-1 rounded-t bg-indigo-500 dark:bg-indigo-400"
                style={{ height: `${(b.value / max) * 100}%`, minHeight: b.value > 0 ? 4 : 2 }}
                title={`${b.label}: ${b.value}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {buckets.map((b) => (
              <span key={b.bucket} className="flex-1 truncate text-center text-[9px] text-zinc-400 dark:text-zinc-500">
                {b.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        last && (
          <div className="mt-4 flex justify-center">
            <ProgressRing
              value={last.value}
              total={Math.max(1, circleTotal)}
              size={128}
              strokeWidth={11}
              label={`${last.value}/${circleTotal}`}
              sublabel={last.label}
            />
          </div>
        )
      )}
    </div>
  );
}
