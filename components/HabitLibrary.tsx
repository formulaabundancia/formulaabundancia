"use client";

import { useEffect, useState } from "react";
import { getHabits, setHabitStatus } from "@/lib/storage";
import { AREAS, DIMENSIONS } from "@/lib/sections";
import { Habit } from "@/lib/types";

function placeLabel(h: Habit): string {
  const area = AREAS.find((a) => a.id === h.area)?.label ?? h.area;
  const dim = DIMENSIONS.find((d) => d.id === h.dimension)?.label ?? h.dimension;
  return `${area} · ${dim}`;
}

export function HabitLibrary() {
  const [suggested, setSuggested] = useState<Habit[]>([]);
  const [declined, setDeclined] = useState<Habit[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    getHabits({ status: "suggested" }).then(setSuggested);
    getHabits({ status: "declined" }).then(setDeclined);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Sugerencias</h3>
        {suggested.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No hay sugerencias pendientes.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {suggested.map((h) => (
              <li
                key={h.key}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
              >
                <div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-100">{h.label}</p>
                  <p className="text-xs text-zinc-400">{placeLabel(h)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHabitStatus(h.key, "active").then(refresh)}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                  >
                    Añadir
                  </button>
                  <button
                    onClick={() => setHabitStatus(h.key, "declined").then(refresh)}
                    className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                  >
                    Ahora no
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {declined.length > 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Descartados (puedes reactivarlos)</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {declined.map((h) => (
              <li
                key={h.key}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800/60"
              >
                <span className="text-zinc-500 dark:text-zinc-400">{h.label}</span>
                <button
                  onClick={() => setHabitStatus(h.key, "suggested").then(refresh)}
                  className="text-xs text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  Volver a sugerencias
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
