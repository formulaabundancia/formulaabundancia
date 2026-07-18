"use client";

import { useMemo, useState } from "react";
import { FitnessData } from "@/lib/useFitnessState";
import { personalRecords, summarize, volumeByDay, DayVolume, PersonalRecord } from "@/lib/fitness-stats";
import { FitnessMuscleGroupBadge } from "./FitnessMuscleGroupBadge";

function WeightChart({ f }: { f: FitnessData }) {
  const latest = f.bodyWeightLog[f.bodyWeightLog.length - 1];
  const [value, setValue] = useState(latest ? String(latest.weight) : "");
  const points = f.bodyWeightLog.slice(-12);
  const weights = points.map((p) => p.weight);
  const min = weights.length ? Math.min(...weights) : 0;
  const max = weights.length ? Math.max(...weights) : 0;
  const range = max - min || 1;

  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">⚖️ Peso corporal</h3>
        {latest && <span className="text-sm font-bold text-zinc-900 dark:text-white">{latest.weight} kg</span>}
      </div>

      {points.length >= 2 ? (
        <div className="mb-3 flex h-20 items-end gap-1">
          {points.map((p) => {
            const h = 12 + ((p.weight - min) / range) * 56;
            return (
              <div key={p.id} className="flex-1" title={`${p.date}: ${p.weight}kg`}>
                <div className="w-full rounded-t-sm bg-gradient-to-t from-orange-600 to-orange-400" style={{ height: `${h}px` }} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Registra al menos 2 días para ver la evolución.
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Peso hoy (kg)"
          className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-orange-500 dark:bg-zinc-800 dark:text-white dark:ring-white/10"
        />
        <button
          onClick={() => value && f.addBodyWeightEntry(Number(value))}
          disabled={!value}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

function VolumeChart({ data }: { data: DayVolume[] }) {
  const max = Math.max(1, ...data.map((d) => d.volume));
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
      <h3 className="mb-3 text-sm font-bold text-zinc-700 dark:text-zinc-300">📊 Volumen · últimos 7 días</h3>
      <div className="flex h-24 items-end gap-2">
        {data.map((d) => {
          const h = d.volume > 0 ? 8 + (d.volume / max) * 72 : 3;
          const label = d.date.slice(8, 10) + "/" + d.date.slice(5, 7);
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm ${d.volume > 0 ? "bg-emerald-500" : "bg-zinc-200 dark:bg-white/10"}`}
                style={{ height: `${h}px` }}
                title={`${d.volume} kg`}
              />
              <span className="text-[9px] text-zinc-400 dark:text-zinc-600">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PRsList({ records }: { records: PersonalRecord[] }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
      <h3 className="mb-3 text-sm font-bold text-zinc-700 dark:text-zinc-300">🏆 Marcas personales</h3>
      {records.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Registra series con peso para ver tus mejores marcas aquí.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {records.slice(0, 8).map((r) => (
            <li
              key={r.exerciseId}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 dark:bg-white/5"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50">
                <span className="truncate">{r.exerciseName}</span>
                <FitnessMuscleGroupBadge group={r.muscleGroup} />
              </span>
              <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-300">
                {r.maxWeight}kg × {r.repsAtMax}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FitnessStatsModal({ f, onClose }: { f: FitnessData; onClose: () => void }) {
  const volume = useMemo(() => volumeByDay(f.routine, 7), [f.routine]);
  const records = useMemo(() => personalRecords(f.routine), [f.routine]);
  const summary = useMemo(() => summarize(f.routine), [f.routine]);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Progreso</h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pt-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-zinc-50 py-2.5 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{summary.totalWorkoutDays}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">DÍAS ENTRENADOS</div>
            </div>
            <div className="rounded-xl bg-zinc-50 py-2.5 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{summary.totalSets}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">SERIES TOTALES</div>
            </div>
            <div className="rounded-xl bg-zinc-50 py-2.5 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-white/10">
              <div className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
                {summary.totalVolume.toLocaleString("es-ES")}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">KG VOLUMEN</div>
            </div>
          </div>

          <WeightChart f={f} />
          <VolumeChart data={volume} />
          <PRsList records={records} />
        </div>
      </div>
    </div>
  );
}
