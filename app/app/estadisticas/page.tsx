"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
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

function ProfileStatsCard({ profile }: { profile: Profile }) {
  const [xp, setXp] = useState(0);
  const [today, setToday] = useState({ done: 0, total: 0 });

  useEffect(() => {
    getTotalXP(profile.id).then(setXp);
    getTodayProgress(profile.id, RITUAL_STEP_KEYS, RITUALS.length).then(setToday);
  }, [profile.id]);

  const pct = today.total ? Math.round((today.done / today.total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium text-zinc-800 dark:text-zinc-100">{PROFILE_DISPLAY_NAMES[profile.name]}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{xp} XP</p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Meta de hoy: {today.done}/{today.total}
      </p>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
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

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">📊 Estadísticas</h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {adultProfiles.map((p) => (
              <ProfileStatsCard key={p.id} profile={p} />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-100">Rituales de hoy</h2>
            <div className="mt-4 flex flex-col gap-3">
              {RITUALS.map((r) => (
                <div key={r.key}>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{r.title}</p>
                  <div className="mt-1 flex gap-4">
                    {adultProfiles.map((p) => {
                      const progress = ritualProgress[`${r.key}:${p.id}`] ?? { done: 0, total: r.steps.length };
                      return (
                        <span key={p.id} className="text-xs text-zinc-500 dark:text-zinc-400">
                          {PROFILE_DISPLAY_NAMES[p.name]}: {progress.done}/{progress.total}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-100">Rachas de hábitos sueltos</h2>
            <div className="mt-4 flex flex-col gap-3">
              {looseHabits.map((h) => (
                <div key={h.key}>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{h.label}</p>
                  <div className="mt-1 flex gap-4">
                    {adultProfiles.map((p) => {
                      const streak = streaks[`${h.key}:${p.id}`] ?? 0;
                      const badge = badgeForStreak(streak);
                      return (
                        <span key={p.id} className="text-xs text-zinc-500 dark:text-zinc-400">
                          {PROFILE_DISPLAY_NAMES[p.name]}: 🔥 {streak} {badge ?? ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-100">Últimos 7 días</h2>
            <div className="mt-4 flex flex-col gap-4">
              {adultProfiles.map((p) => {
                const week = weeks[p.id] ?? [];
                const max = Math.max(1, ...week.map((d) => d.count));
                return (
                  <div key={p.id}>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{PROFILE_DISPLAY_NAMES[p.name]}</p>
                    <div className="mt-1 flex items-end gap-1.5" style={{ height: 48 }}>
                      {week.map((d) => (
                        <div
                          key={d.date}
                          className="flex-1 rounded-t bg-emerald-400 dark:bg-emerald-600"
                          style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 2 }}
                          title={`${d.date}: ${d.count}`}
                        />
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
