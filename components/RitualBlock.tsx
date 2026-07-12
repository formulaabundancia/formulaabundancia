"use client";

import { useEffect, useState } from "react";
import { dailyTip, getRitual, RitualKey, STEP_META } from "@/lib/rituals";
import { getHabits, getHabitLog, getRitualStreak, toggleHabitLog, todayStr } from "@/lib/storage";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";
import { FlameIcon } from "@/components/icons";

export function RitualBlock({ ritualKey }: { ritualKey: RitualKey }) {
  const { adultProfiles } = useProfile();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [labelsLoaded, setLabelsLoaded] = useState(false);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({}); // `${profileId}:${stepKey}` -> done
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [version, setVersion] = useState(0);
  const today = todayStr();
  const ritual = getRitual(ritualKey);

  useEffect(() => {
    getHabits().then((habits) => {
      const map: Record<string, string> = {};
      habits.forEach((h) => (map[h.key] = h.label));
      setLabels(map);
      setLabelsLoaded(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries: Record<string, boolean> = {};
      const streakEntries: Record<string, number> = {};
      for (const p of adultProfiles) {
        for (const step of ritual.steps) {
          entries[`${p.id}:${step}`] = await getHabitLog(step, p.id, today);
        }
        streakEntries[p.id] = await getRitualStreak(ritual.steps, p.id);
      }
      if (!cancelled) {
        setDoneMap(entries);
        setStreaks(streakEntries);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adultProfiles.map((p) => p.id).join(","), ritualKey, version]);

  const toggle = async (profileId: string, stepKey: string) => {
    await toggleHabitLog(stepKey, profileId, today);
    setVersion((v) => v + 1);
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{ritual.title}</h3>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Toca cada paso para marcarlo hecho</p>

      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 dark:bg-amber-950/20">
        <span className="text-sm">💡</span>
        <p className="text-xs italic leading-snug text-amber-800 dark:text-amber-300">{dailyTip(ritual)}</p>
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {adultProfiles.map((p) => {
          const done = ritual.steps.filter((step) => doneMap[`${p.id}:${step}`]).length;
          const total = ritual.steps.length;
          const streak = streaks[p.id] ?? 0;

          return (
            <div key={p.id}>
              <div className="mb-3 flex items-center gap-3">
                <ProgressRing value={done} total={total} size={44} strokeWidth={5} label={`${done}/${total}`} />
                <div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">{PROFILE_DISPLAY_NAMES[p.name]}</span>
                  {streak > 0 && (
                    <p className="flex items-center gap-1 text-xs font-medium text-orange-500">
                      <FlameIcon className="h-3 w-3" />
                      {streak} {streak === 1 ? "día seguido" : "días seguidos"}
                    </p>
                  )}
                </div>
              </div>
              {labelsLoaded ? (
                <div className="flex flex-col gap-4">
                  {(ritual.groups ?? [{ label: null, steps: ritual.steps }]).map((group, gi) => (
                    <div key={group.label ?? gi} className="flex flex-col gap-1.5">
                      {group.label && (
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                          {group.label}
                        </p>
                      )}
                      {group.steps.map((stepKey) => {
                        const stepDone = doneMap[`${p.id}:${stepKey}`];
                        const meta = STEP_META[stepKey];
                        return (
                          <button
                            key={stepKey}
                            onClick={() => toggle(p.id, stepKey)}
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                              stepDone ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-zinc-50 dark:bg-zinc-800/60"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                                stepDone
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-zinc-300 dark:border-zinc-600"
                              }`}
                            >
                              {stepDone ? "✓" : ""}
                            </span>
                            {meta && (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-zinc-900">
                                {meta.icon}
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm ${
                                  stepDone
                                    ? "text-emerald-700 line-through dark:text-emerald-400"
                                    : "text-zinc-700 dark:text-zinc-200"
                                }`}
                              >
                                {labels[stepKey] ?? stepKey}
                              </p>
                              {meta?.time && (
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">🕐 {meta.time}</p>
                              )}
                            </div>
                            {meta && (
                              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                                {meta.tag}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {ritual.steps.map((stepKey) => (
                    <div key={stepKey} className="h-12 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
