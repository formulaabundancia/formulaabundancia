"use client";

import { useEffect, useState } from "react";
import { getTaskLog, todayStr } from "@/lib/storage";
import { PROFILE_AVATAR_COLOR, PROFILE_DISPLAY_NAMES, TaskLogEntry } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

const BAR_COLOR: Record<string, string> = {
  jose: "bg-sky-500",
  viviana: "bg-rose-500",
  dylan: "bg-orange-500",
};

function weekAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

function monthStartStr(): string {
  return `${todayStr().slice(0, 7)}-01`;
}

export function TaskStats({ blockKey, refreshKey }: { blockKey: string; refreshKey: number }) {
  const { allProfiles } = useProfile();
  const [log, setLog] = useState<TaskLogEntry[] | null>(null);

  useEffect(() => {
    const since = monthStartStr() < weekAgoStr() ? monthStartStr() : weekAgoStr();
    getTaskLog(blockKey, since).then(setLog);
  }, [blockKey, refreshKey]);

  if (!log) return null;

  const weekStart = weekAgoStr();
  const monthStart = monthStartStr();
  const people = allProfiles.filter((p) => log.some((l) => l.profileId === p.id) || p.role === "adult");

  const monthCount = (pid: string) => log.filter((l) => l.profileId === pid && l.date >= monthStart).length;
  const weekCount = (pid: string) => log.filter((l) => l.profileId === pid && l.date >= weekStart).length;

  const monthTotal = people.reduce((sum, p) => sum + monthCount(p.id), 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Reparto de tareas</h3>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Quién ha hecho qué — para repartir mejor.</p>

      {monthTotal === 0 ? (
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500">
          Aún no hay tareas completadas este mes. Marca alguna y aquí verás el reparto.
        </p>
      ) : (
        <>
          {/* Barra de reparto del mes */}
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            {people.map((p) => {
              const pct = (monthCount(p.id) / monthTotal) * 100;
              if (pct === 0) return null;
              return <div key={p.id} className={BAR_COLOR[p.name]} style={{ width: `${pct}%` }} title={`${PROFILE_DISPLAY_NAMES[p.name]}: ${Math.round(pct)}%`} />;
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {people.map((p) => (
              <div key={p.id} className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${PROFILE_AVATAR_COLOR[p.name]}`}>
                    {PROFILE_DISPLAY_NAMES[p.name][0]}
                  </span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{PROFILE_DISPLAY_NAMES[p.name]}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{monthCount(p.id)}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">este mes</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{weekCount(p.id)}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">7 días</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
