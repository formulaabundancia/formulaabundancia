"use client";

import { useEffect, useState } from "react";
import { getRitual, RitualKey } from "@/lib/rituals";
import { getHabits, getHabitLog, toggleHabitLog, todayStr } from "@/lib/storage";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

export function RitualBlock({ ritualKey }: { ritualKey: RitualKey }) {
  const { adultProfiles } = useProfile();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({}); // `${profileId}:${stepKey}` -> done
  const [version, setVersion] = useState(0);
  const today = todayStr();
  const ritual = getRitual(ritualKey);

  useEffect(() => {
    getHabits().then((habits) => {
      const map: Record<string, string> = {};
      habits.forEach((h) => (map[h.key] = h.label));
      setLabels(map);
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{ritual.title}</h3>

      <div className="mt-4 flex flex-col gap-5">
        {adultProfiles.map((p) => {
          const done = ritual.steps.filter((step) => doneMap[`${p.id}:${step}`]).length;
          const total = ritual.steps.length;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div key={p.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{PROFILE_DISPLAY_NAMES[p.name]}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {done}/{total} hoy
                </span>
              </div>
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
