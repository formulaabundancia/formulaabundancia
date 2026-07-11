"use client";

import { useEffect, useState } from "react";
import { getRitual, RitualKey } from "@/lib/rituals";
import { getHabits, getHabitLog, toggleHabitLog, todayStr } from "@/lib/storage";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";

export function RitualBlock({ ritualKey }: { ritualKey: RitualKey }) {
  const { adultProfiles } = useProfile();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [labelsLoaded, setLabelsLoaded] = useState(false);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({}); // `${profileId}:${stepKey}` -> done
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
      for (const p of adultProfiles) {
        for (const step of ritual.steps) {
          entries[`${p.id}:${step}`] = await getHabitLog(step, p.id, today);
        }
      }
      if (!cancelled) setDoneMap(entries);
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

      <div className="mt-4 flex flex-col gap-5">
        {adultProfiles.map((p) => {
          const done = ritual.steps.filter((step) => doneMap[`${p.id}:${step}`]).length;
          const total = ritual.steps.length;

          return (
            <div key={p.id}>
              <div className="mb-3 flex items-center gap-3">
                <ProgressRing value={done} total={total} size={44} strokeWidth={5} label={`${done}/${total}`} />
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{PROFILE_DISPLAY_NAMES[p.name]}</span>
              </div>
              {labelsLoaded ? (
                <div className="flex flex-col gap-1.5">
                  {ritual.steps.map((stepKey, i) => {
                    const stepDone = doneMap[`${p.id}:${stepKey}`];
                    return (
                      <button
                        key={stepKey}
                        onClick={() => toggle(p.id, stepKey)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                          stepDone ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-zinc-50 dark:bg-zinc-800/60"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                            stepDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          {stepDone ? "✓" : i + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            stepDone
                              ? "text-emerald-700 line-through dark:text-emerald-400"
                              : "text-zinc-700 dark:text-zinc-200"
                          }`}
                        >
                          {labels[stepKey] ?? stepKey}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {ritual.steps.map((stepKey) => (
                    <div key={stepKey} className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
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
