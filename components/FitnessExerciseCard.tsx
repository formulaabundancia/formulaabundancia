"use client";

import { useState } from "react";
import { FitnessDayExercise, FitnessIntensity, INTENSITIES, volumeOfExercise } from "@/lib/fitness-types";
import { FitnessMuscleGroupBadge } from "./FitnessMuscleGroupBadge";
import { FitnessExerciseThumb } from "./FitnessExerciseThumb";
import { FitnessExerciseDetail } from "./FitnessExerciseDetail";

const INTENSITY_STYLE: Record<FitnessIntensity, string> = {
  Suave: "bg-emerald-100 text-emerald-700 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40",
  Media: "bg-amber-100 text-amber-700 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40",
  Fuerte: "bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/40",
};

export function FitnessExerciseCard({
  exercise,
  onAddSet,
  onRemoveSet,
  onToggleDone,
  onRemove,
}: {
  exercise: FitnessDayExercise;
  onAddSet: (weight: number, reps: number, intensity: FitnessIntensity) => void;
  onRemoveSet: (setId: string) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}) {
  const last = exercise.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(last ? String(last.weight) : "");
  const [reps, setReps] = useState(last ? String(last.reps) : "");
  const [intensity, setIntensity] = useState<FitnessIntensity>(last?.intensity ?? "Media");
  const [open, setOpen] = useState(exercise.sets.length === 0);
  const [showDetail, setShowDetail] = useState(false);

  const canSubmit = weight !== "" && reps !== "" && Number(reps) > 0;
  const volume = volumeOfExercise(exercise);

  const handleAdd = () => {
    if (!canSubmit) return;
    onAddSet(Number(weight), Number(reps), intensity);
    setOpen(false);
  };

  return (
    <div
      className={`rounded-2xl p-3.5 ring-1 transition-colors ${
        exercise.done
          ? "bg-orange-50 ring-orange-200 dark:bg-orange-500/[0.06] dark:ring-orange-500/25"
          : "bg-zinc-50 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onToggleDone}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ring-2 transition-colors ${
            exercise.done
              ? "bg-orange-500 ring-orange-500 text-white"
              : "text-transparent ring-zinc-300 hover:ring-orange-500 dark:ring-zinc-600"
          }`}
          aria-label={exercise.done ? "Marcar como no hecho" : "Marcar como hecho"}
        >
          <span className="text-xs font-bold">✓</span>
        </button>

        <button onClick={() => setShowDetail(true)} className="flex-shrink-0" aria-label="Ver cómo se hace">
          <FitnessExerciseThumb image={exercise.image} name={exercise.name} muscleGroup={exercise.muscleGroup} size={44} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              onClick={() => setShowDetail(true)}
              className={`text-left font-semibold ${
                exercise.done ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-900 dark:text-white"
              }`}
            >
              {exercise.name}
            </button>
            <FitnessMuscleGroupBadge group={exercise.muscleGroup} />
          </div>
          {exercise.equipment && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500">{exercise.equipment}</span>
          )}

          {exercise.sets.length > 0 && (
            <ul className="mt-2 space-y-1">
              {exercise.sets.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    <span className="text-zinc-400 dark:text-zinc-500">{i + 1}.</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-white">{s.weight} kg</span>
                    {" × "}
                    <span className="font-medium text-zinc-900 dark:text-white">{s.reps}</span>{" "}
                    <span className="text-zinc-400 dark:text-zinc-500">reps</span>
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ring-1 ring-inset ${INTENSITY_STYLE[s.intensity]}`}
                    >
                      {s.intensity}
                    </span>
                  </span>
                  <button
                    onClick={() => onRemoveSet(s.id)}
                    className="text-zinc-300 hover:text-rose-500 dark:text-zinc-600 dark:hover:text-rose-400"
                    aria-label="Eliminar serie"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {exercise.sets.length > 0 && (
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
              {exercise.sets.length} serie{exercise.sets.length === 1 ? "" : "s"} ·{" "}
              {volume.toLocaleString("es-ES")} kg de volumen
            </p>
          )}
        </div>

        <button
          onClick={onRemove}
          className="text-zinc-300 hover:text-rose-500 dark:text-zinc-600 dark:hover:text-rose-400"
          aria-label="Quitar ejercicio del día"
        >
          🗑
        </button>
      </div>

      {open ? (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-200 pt-3 dark:border-white/5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Peso (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-20 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent focus:ring-orange-500 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Repeticiones</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-20 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-sm text-zinc-900 outline-none ring-1 ring-transparent focus:ring-orange-500 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Intensidad</span>
            <div className="flex gap-1">
              {INTENSITIES.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntensity(opt)}
                  className={`rounded-lg px-2 py-1.5 text-xs ring-1 ring-inset ${
                    intensity === opt
                      ? INTENSITY_STYLE[opt]
                      : "bg-zinc-100 text-zinc-500 ring-transparent dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canSubmit}
            className="ml-auto rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Guardar serie
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-1.5 text-xs font-medium text-zinc-500 hover:border-orange-400 hover:text-orange-600 dark:border-white/15 dark:text-zinc-400 dark:hover:border-orange-500/50 dark:hover:text-orange-300"
        >
          + Añadir serie
        </button>
      )}

      {showDetail && (
        <FitnessExerciseDetail
          name={exercise.name}
          muscleGroup={exercise.muscleGroup}
          equipment={exercise.equipment}
          gif={exercise.gif}
          image={exercise.image}
          steps={exercise.steps}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}
