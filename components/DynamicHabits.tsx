"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExplicitlyPlacedHabitKeys } from "@/lib/sections";
import { getHabits } from "@/lib/storage";
import { Area, Dimension, Habit } from "@/lib/types";
import { HeatmapGrid } from "@/components/HeatmapGrid";

export function DynamicHabits({ area, dimension }: { area: Area; dimension: Dimension }) {
  const [habits, setHabits] = useState<Habit[] | null>(null);

  useEffect(() => {
    getHabits({ status: "active", area, dimension }).then((active) => {
      const placed = getExplicitlyPlacedHabitKeys();
      setHabits(active.filter((h) => !placed.has(h.key)));
    });
  }, [area, dimension]);

  if (!habits) return null;

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Sin hábitos sueltos aquí todavía.{" "}
        <Link href="/app/libreria" className="underline">
          Añade uno desde la librería
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {habits.map((h) => (
        <HeatmapGrid key={h.key} habitKey={h.key} />
      ))}
    </div>
  );
}
