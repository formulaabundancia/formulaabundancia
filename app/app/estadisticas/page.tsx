"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { ChartIcon, FlameIcon, TrophyIcon } from "@/components/icons";
import { RITUALS } from "@/lib/rituals";
import { Habit, PROFILE_DISPLAY_NAMES, Profile } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import {
  badgeForStreak,
  getHabits,
  getHabitStreak,
  getRitualProgress,
  getTodayProgress,
  getTotalXP,
  getWeeklyCounts,
  todayStr,
} from "@/lib/storage";

const RITUAL_STEP_KEYS = new Set(RITUALS.flatMap((r) => r.steps));
const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];

function dayLetter(dateStr: string): string {
  return DAY_LETTERS[new Date(`${dateStr}T00:00:00`).getDay()];
}

const XP_PER_LEVEL = 100;

function ProfileStatsCard({ profile, bestStreak }: { profile: Profile; bestStreak: number }) {
  const [xp, setXp] = useState(0);
  const [today, setToday] = useState({ done: 0, total: 0 });

  useEffect(() => {
    getTotalXP(profile.id).then(setXp);
    getTodayProgress(profile.id, RITUAL_STEP_KEYS, RITUALS.length).then(setToday);
  }, [profile.id]);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-4">
        <ProgressRing value={today.done} total={today.total} size={72} strokeWidth={7} sublabel="hoy" />
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">{PROFILE_DISPLAY_NAMES[profile.name]}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{xp} FA</p>
          {bestStreak > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-orange-500">
              <FlameIcon className="h-3.5 w-3.5" />
              {bestStreak} {bestStreak === 1 ? "día" : "días"}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <span>Nivel {level}</span>
          <span>
            {xpIntoLevel}/{XP_PER_LEVEL}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-700 dark:bg-indigo-400"
            style={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function EstadisticasPage() {
  const { adultProfiles } = useProfile();
  const [looseHabits, setLooseHabits] = useState<Habit[]>([]);
  const [ritualProgress, setRitualProgress] = useState<Record<string, { done: number; total: number }>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [weeks, setWeeks] = useState<Record<string, { date: string; count: number }[]>>({});

  useEffect(() => {
    getHabits({ status: "active" }).then((habits) => setLooseHabits(habits.filter((h) => !RITUAL_STEP_KEYS.has(h.key))));
  }, []);

  useEffect(() => {
    if (adultProfiles.length === 0) return;
    const today = todayStr();
    (async () => {
      const rp: Record<string, { done: number; total: number }> = {};
      for (const r of RITUALS) {
        for (const p of adultProfiles) {
          rp[`${r.key}:${p.id}`] = await getRitualProgress(r.steps, p.id, today);
        }
      }
      setRitualProgress(rp);

      const wk: Record<string, { date: string; count: number }[]> = {};
      for (const p of adultProfiles) {
        wk[p.id] = await getWeeklyCounts(p.id);
      }
      setWeeks(wk);
    })();
  }, [adultProfiles.map((p) => p.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (adultProfiles.length === 0 || looseHabits.length === 0) return;
    (async () => {
      const s: Record<string, number> = {};
      for (const h of looseHabits) {
        for (const p of adultProfiles) {
          s[`${h.key}:${p.id}`] = await getHabitStreak(h.key, p.id);
        }
      }
      setStreaks(s);
    })();
  }, [looseHabits, adultProfiles.map((p) => p.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const bestStreakFor = (profileId: string) =>
    Math.max(0, ...looseHabits.map((h) => streaks[`${h.key}:${profileId}`] ?? 0));

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <ChartIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Estadísticas</h1>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {adultProfiles.map((p) => (
              <ProfileStatsCard key={p.id} profile={p} bestStreak={bestStreakFor(p.id)} />
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Rituales de hoy
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {RITUALS.map((r) => (
              <div key={r.key} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{r.title}</p>
                <div className="mt-3 flex flex-col gap-3">
                  {adultProfiles.map((p) => {
                    const progress = ritualProgress[`${r.key}:${p.id}`] ?? { done: 0, total: r.steps.length };
                    return (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <ProgressRing value={progress.done} total={progress.total} size={36} strokeWidth={4} />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          {PROFILE_DISPLAY_NAMES[p.name]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Rachas de hábitos
          </h2>
          <div className="flex flex-col gap-3">
            {looseHabits.map((h) => (
              <div key={h.key} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{h.label}</p>
                <div className="mt-3 flex gap-6">
                  {adultProfiles.map((p) => {
                    const streak = streaks[`${h.key}:${p.id}`] ?? 0;
                    const badge = badgeForStreak(streak);
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${streak > 0 ? "bg-orange-100 dark:bg-orange-950/40" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                          <FlameIcon className={`h-5 w-5 ${streak > 0 ? "text-orange-500" : "text-zinc-400 dark:text-zinc-600"}`} />
                        </span>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{PROFILE_DISPLAY_NAMES[p.name]}</p>
                          <p className="flex items-center gap-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            {streak}
                            {badge && <span className="text-sm">{badge}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {looseHabits.length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay hábitos sueltos activos.</p>
            )}
          </div>

          <div className="mb-3 mt-8 flex items-center gap-2">
            <TrophyIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Últimos 7 días
            </h2>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
            <div className="flex flex-col gap-5">
              {adultProfiles.map((p) => {
                const week = weeks[p.id] ?? [];
                const max = Math.max(1, ...week.map((d) => d.count));
                return (
                  <div key={p.id}>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {PROFILE_DISPLAY_NAMES[p.name]}
                    </p>
                    <div className="mt-2 flex items-end gap-1.5" style={{ height: 56 }}>
                      {week.map((d) => (
                        <div
                          key={d.date}
                          className="flex-1 rounded-t bg-indigo-500 dark:bg-indigo-400"
                          style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 2 }}
                          title={`${d.date}: ${d.count}`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 flex gap-1.5">
                      {week.map((d) => (
                        <span key={d.date} className="flex-1 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
                          {dayLetter(d.date)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
