"use client";

import { useEffect, useState } from "react";
import { dailyTip, getRitual, RITUAL_GROUPS, RITUAL_TAG, RitualKey } from "@/lib/rituals";
import {
  addRitualStep,
  deleteHabit,
  getHabitLogsForKeys,
  getHabits,
  getRitualStreak,
  toggleHabitLog,
  todayStr,
  updateHabit,
} from "@/lib/storage";
import { Habit, PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";
import { FlameIcon } from "@/components/icons";

interface Draft {
  label: string;
  timeLabel: string;
  icon: string;
}

function AddStepForm({
  ritualKey,
  ritualGroup,
  onAdded,
}: {
  ritualKey: RitualKey;
  ritualGroup?: string;
  onAdded: () => void;
}) {
  const [label, setLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || saving) return;
    setSaving(true);
    await addRitualStep(ritualKey, label.trim(), {
      ritualGroup,
      timeLabel: timeLabel.trim() || undefined,
      icon: icon.trim() || undefined,
    });
    setLabel("");
    setTimeLabel("");
    setIcon("");
    setSaving(false);
    onAdded();
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-1.5">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="+ Añadir paso"
        className="min-w-[120px] flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
      />
      <input
        value={timeLabel}
        onChange={(e) => setTimeLabel(e.target.value)}
        placeholder="Hora"
        className="w-16 rounded-xl border border-zinc-200 px-2 py-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
      />
      <input
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        placeholder="🙂"
        maxLength={4}
        className="w-12 rounded-xl border border-zinc-200 px-2 py-2 text-center text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        +
      </button>
    </form>
  );
}

export function RitualBlock({ ritualKey }: { ritualKey: RitualKey }) {
  const { adultProfiles } = useProfile();
  const [steps, setSteps] = useState<Habit[] | null>(null);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({}); // `${profileId}:${stepKey}` -> done
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const today = todayStr();
  const ritual = getRitual(ritualKey);
  const groups = RITUAL_GROUPS[ritualKey];
  const sections = groups ?? [{ id: "", label: "" }];

  const loadSteps = () => {
    getHabits({ status: "active", ritualKey }).then((habits) => {
      setSteps(habits);
      setDrafts(
        Object.fromEntries(
          habits.map((h) => [h.key, { label: h.label, timeLabel: h.timeLabel ?? "", icon: h.icon ?? "" }])
        )
      );
    });
  };

  useEffect(() => {
    loadSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ritualKey]);

  const stepKeys = (steps ?? []).map((s) => s.key);
  const stepKeysJoined = stepKeys.join(",");

  useEffect(() => {
    if (!steps || adultProfiles.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries: Record<string, boolean> = {};
      const streakEntries: Record<string, number> = {};
      await Promise.all(
        adultProfiles.map(async (p) => {
          const [done, streak] = await Promise.all([
            getHabitLogsForKeys(p.id, stepKeys, today),
            getRitualStreak(stepKeys, p.id),
          ]);
          for (const key of stepKeys) entries[`${p.id}:${key}`] = done.has(key);
          streakEntries[p.id] = streak;
        })
      );
      if (!cancelled) {
        setDoneMap(entries);
        setStreaks(streakEntries);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKeysJoined, adultProfiles.map((p) => p.id).join(","), version]);

  const toggle = async (profileId: string, stepKey: string) => {
    await toggleHabitLog(stepKey, profileId, today);
    setVersion((v) => v + 1);
  };

  const stepsByGroup = (groupId: string) => (steps ?? []).filter((s) => (s.ritualGroup ?? "") === groupId);

  const saveDrafts = async () => {
    if (!steps) return;
    await Promise.all(
      steps.map((s) => {
        const d = drafts[s.key];
        if (!d) return Promise.resolve();
        if (d.label === s.label && (d.timeLabel || "") === (s.timeLabel || "") && (d.icon || "") === (s.icon || "")) {
          return Promise.resolve();
        }
        return updateHabit(s.key, { label: d.label.trim() || s.label, timeLabel: d.timeLabel, icon: d.icon });
      })
    );
    setEditing(false);
    loadSteps();
  };

  const removeStep = async (key: string) => {
    await deleteHabit(key);
    loadSteps();
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{ritual.title}</h3>
        <button
          onClick={() => (editing ? saveDrafts() : setEditing(true))}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          {editing ? "Guardar" : "Editar"}
        </button>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        {editing ? "Añade, renombra o elimina pasos" : "Toca cada paso para marcarlo hecho"}
      </p>

      {!editing && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 dark:bg-amber-950/20">
          <span className="text-sm">💡</span>
          <p className="text-xs italic leading-snug text-amber-800 dark:text-amber-300">{dailyTip(ritual)}</p>
        </div>
      )}

      {!steps ? (
        <div className="mt-4 flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
          ))}
        </div>
      ) : editing ? (
        <div className="mt-4 flex flex-col gap-5">
          {sections.map((section) => (
            <div key={section.id || "flat"} className="flex flex-col gap-1.5">
              {section.label && (
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {section.label}
                </p>
              )}
              {stepsByGroup(section.id).map((s) => (
                <div
                  key={s.key}
                  className="flex items-center gap-1.5 rounded-2xl bg-zinc-50 px-2 py-1.5 dark:bg-zinc-800/60"
                >
                  <input
                    value={drafts[s.key]?.label ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: { ...d[s.key], label: e.target.value } }))}
                    className="min-w-0 flex-1 rounded-lg border border-transparent bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
                  />
                  <input
                    value={drafts[s.key]?.timeLabel ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [s.key]: { ...d[s.key], timeLabel: e.target.value } }))
                    }
                    placeholder="Hora"
                    className="w-16 rounded-lg border border-transparent bg-white px-1.5 py-1.5 text-xs outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
                  />
                  <input
                    value={drafts[s.key]?.icon ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: { ...d[s.key], icon: e.target.value } }))}
                    maxLength={4}
                    className="w-10 rounded-lg border border-transparent bg-white px-1 py-1.5 text-center text-sm outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
                  />
                  <button
                    onClick={() => removeStep(s.key)}
                    className="shrink-0 px-1 text-zinc-400 hover:text-red-500"
                    aria-label="Eliminar paso"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <AddStepForm ritualKey={ritualKey} ritualGroup={section.id || undefined} onAdded={loadSteps} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {adultProfiles.map((p) => {
            const done = stepKeys.filter((key) => doneMap[`${p.id}:${key}`]).length;
            const total = stepKeys.length;
            const streak = streaks[p.id] ?? 0;

            return (
              <div key={p.id}>
                <div className="mb-3 flex items-center gap-3">
                  <ProgressRing value={done} total={total} size={44} strokeWidth={5} label={`${done}/${total}`} />
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {PROFILE_DISPLAY_NAMES[p.name]}
                    </span>
                    {streak > 0 && (
                      <p className="flex items-center gap-1 text-xs font-medium text-orange-500">
                        <FlameIcon className="h-3 w-3" />
                        {streak} {streak === 1 ? "día seguido" : "días seguidos"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {sections.map((section) => (
                    <div key={section.id || "flat"} className="flex flex-col gap-1.5">
                      {section.label && (
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                          {section.label}
                        </p>
                      )}
                      {stepsByGroup(section.id).map((s) => {
                        const stepDone = doneMap[`${p.id}:${s.key}`];
                        return (
                          <button
                            key={s.key}
                            onClick={() => toggle(p.id, s.key)}
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
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-zinc-900">
                              {s.icon || "✅"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm ${
                                  stepDone
                                    ? "text-emerald-700 line-through dark:text-emerald-400"
                                    : "text-zinc-700 dark:text-zinc-200"
                                }`}
                              >
                                {s.label}
                              </p>
                              {s.timeLabel && (
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">🕐 {s.timeLabel}</p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                              {RITUAL_TAG[ritualKey]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
