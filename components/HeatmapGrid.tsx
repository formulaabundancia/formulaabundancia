"use client";

import { useCallback, useEffect, useState } from "react";
import {
  badgeForStreak,
  getHabit,
  getHabitCount,
  getHabitLog,
  getHabitStreak,
  incrementHabitCount,
  toggleHabitLog,
} from "@/lib/storage";
import { Habit, HabitKey, PROFILE_DISPLAY_NAMES, Profile } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

const DAYS = 84; // 12 semanas

function lastDates(n: number): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const dates = lastDates(DAYS);
const today = dates[dates.length - 1];

function ProfileRow({ habit, profile, version, onTap }: { habit: Habit; profile: Profile; version: number; onTap: (date: string) => void }) {
  const [entries, setEntries] = useState<Record<string, { done: boolean; count: number }>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        dates.map(async (date) => ({
          date,
          done: await getHabitLog(habit.key, profile.id, date),
          count: habit.multiCheck ? await getHabitCount(habit.key, profile.id, date) : 0,
        }))
      );
      if (cancelled) return;
      const map: Record<string, { done: boolean; count: number }> = {};
      results.forEach((r) => (map[r.date] = { done: r.done, count: r.count }));
      setEntries(map);
      setStreak(await getHabitStreak(habit.key, profile.id));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.key, profile.id, version]);

  const badge = badgeForStreak(streak);
  const todayCount = entries[today]?.count ?? 0;
  const todayDone = entries[today]?.done ?? false;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">{PROFILE_DISPLAY_NAMES[profile.name]}</span>
        <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
          {habit.multiCheck ? (
            <span>
              Hoy: {todayCount}/{habit.metaDiaria}
            </span>
          ) : (
            streak > 0 && (
              <span>
                🔥 {streak} {streak === 1 ? "día" : "días"}
              </span>
            )
          )}
          {badge && <span className="text-sm">{badge}</span>}
        </span>
      </div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
        {dates.map((date) => {
          const isToday = date === today;
          const entry = entries[date];
          const count = entry?.count ?? 0;
          const done = habit.multiCheck ? count >= (habit.metaDiaria ?? 1) : (entry?.done ?? false);
          const intensity = habit.multiCheck ? Math.min(1, count / (habit.metaDiaria ?? 1)) : done ? 1 : 0;
          return (
            <button
              key={date}
              onClick={() => onTap(date)}
              title={`${date}${habit.multiCheck ? ` — ${count}` : done ? " — hecho" : ""}`}
              className={`aspect-square rounded-[3px] transition ${isToday ? "ring-1 ring-emerald-500" : ""}`}
              style={{
                backgroundColor:
                  intensity === 0 ? "var(--heatmap-empty, #e4e4e7)" : `rgba(16, 185, 129, ${0.25 + intensity * 0.75})`,
              }}
            />
          );
        })}
      </div>
      {habit.multiCheck && todayDone && (
        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Meta de hoy cumplida ✓</p>
      )}
    </div>
  );
}

export function HeatmapGrid({ habitKey }: { habitKey: HabitKey }) {
  const { adultProfiles } = useProfile();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    getHabit(habitKey).then((h) => setHabit(h ?? null));
  }, [habitKey]);

  const handleTap = useCallback(
    async (profileId: string, date: string) => {
      if (!habit) return;
      if (habit.multiCheck) {
        await incrementHabitCount(habitKey, profileId, date, habit.metaDiaria ?? 1);
      } else {
        await toggleHabitLog(habitKey, profileId, date);
      }
      setVersion((v) => v + 1);
    },
    [habit, habitKey]
  );

  if (!habit) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{habit.label}</h3>
      <div className="mt-4 flex flex-col gap-4">
        {adultProfiles.map((p) => (
          <ProfileRow key={p.id} habit={habit} profile={p} version={version} onTap={(date) => handleTap(p.id, date)} />
        ))}
      </div>
    </div>
  );
}
