"use client";

import { useMemo, useState } from "react";
import { FitnessExercise, MUSCLE_GROUPS, MuscleGroup } from "@/lib/fitness-types";
import { isHomeFriendly } from "@/lib/fitness-routines";
import { FitnessMuscleGroupBadge } from "./FitnessMuscleGroupBadge";
import { FitnessExerciseThumb } from "./FitnessExerciseThumb";
import { FitnessExerciseDetail } from "./FitnessExerciseDetail";

export function FitnessExercisePicker({
  dayLabel,
  exercises,
  onPick,
  onCreateCustom,
  onClose,
}: {
  dayLabel: string;
  exercises: FitnessExercise[];
  onPick: (exercise: FitnessExercise) => void;
  onCreateCustom: (name: string, muscleGroup: MuscleGroup) => FitnessExercise;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "Todos">("Todos");
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState<MuscleGroup>("Pecho");
  const [preview, setPreview] = useState<FitnessExercise | null>(null);
  const [homeOnly, setHomeOnly] = useState(false);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchesGroup = group === "Todos" || e.muscleGroup === group;
      const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase());
      const matchesHome = !homeOnly || isHomeFriendly(e);
      return matchesGroup && matchesQuery && matchesHome;
    });
  }, [exercises, query, group, homeOnly]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Añadir ejercicio</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">a tu {dayLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-2 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-3 py-2.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent placeholder:text-zinc-400 focus:ring-orange-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            onClick={() => setHomeOnly((v) => !v)}
            className={`flex-shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium ring-1 ring-inset ${
              homeOnly
                ? "bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40"
                : "bg-zinc-100 text-zinc-500 ring-transparent dark:bg-zinc-800 dark:text-zinc-400"
            }`}
            title="Solo ejercicios en casa (sin gimnasio)"
          >
            🏠 En casa
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["Todos", ...MUSCLE_GROUPS] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${
                group === g
                  ? "bg-orange-100 text-orange-700 ring-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-500/40"
                  : "bg-zinc-100 text-zinc-500 ring-transparent dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((ex) => (
              <li key={ex.id}>
                <button
                  onClick={() => setPreview(ex)}
                  className="flex w-full items-center gap-3 py-2 pr-1 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <FitnessExerciseThumb image={ex.image} name={ex.name} muscleGroup={ex.muscleGroup} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-zinc-900 dark:text-zinc-50">{ex.name}</span>
                    {ex.equipment && (
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">{ex.equipment}</span>
                    )}
                  </span>
                  <FitnessMuscleGroupBadge group={ex.muscleGroup} />
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Sin resultados. Crea uno nuevo abajo.
              </li>
            )}
          </ul>
        </div>

        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Crear ejercicio personalizado</p>
          <div className="flex gap-2">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del ejercicio"
              className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-transparent placeholder:text-zinc-400 focus:ring-orange-500 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <select
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value as MuscleGroup)}
              className="rounded-xl bg-zinc-100 px-2 py-2 text-sm text-zinc-900 outline-none dark:bg-zinc-800 dark:text-zinc-50"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={!customName.trim()}
            onClick={() => {
              const created = onCreateCustom(customName.trim(), customGroup);
              onPick(created);
            }}
            className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Crear y añadir
          </button>
        </div>
      </div>

      {preview && (
        <FitnessExerciseDetail
          name={preview.name}
          muscleGroup={preview.muscleGroup}
          equipment={preview.equipment}
          gif={preview.gif}
          image={preview.image}
          steps={preview.steps}
          actionLabel={`Añadir a ${dayLabel}`}
          onAction={() => {
            onPick(preview);
            setPreview(null);
          }}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
