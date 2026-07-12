"use client";

import { useEffect, useState } from "react";
import { getAllExercises, upsertExercise } from "@/lib/storage";
import { Exercise, PROFILE_AVATAR_COLOR, PROFILE_DISPLAY_NAMES, ProfileName } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";
import { PROGRAM_WEEKS } from "@/lib/program";

interface ProgramData {
  semanas: number[];
}

function MiniAvatar({ name }: { name: ProfileName }) {
  return (
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${PROFILE_AVATAR_COLOR[name]}`}
      title={PROFILE_DISPLAY_NAMES[name]}
    >
      {PROFILE_DISPLAY_NAMES[name][0]}
    </span>
  );
}

export function ProgramChecklist() {
  const { profileId, allProfiles } = useProfile();
  const [rows, setRows] = useState<Exercise<ProgramData>[] | null>(null);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  const refresh = () => getAllExercises<ProgramData>("programa").then(setRows);

  useEffect(() => {
    refresh();
  }, []);

  if (!rows) return null;

  const mine = rows.find((r) => r.ownerId === profileId)?.data.semanas ?? [];
  const whoDid = (n: number): ProfileName[] =>
    rows
      .filter((r) => (r.data.semanas ?? []).includes(n))
      .map((r) => allProfiles.find((p) => p.id === r.ownerId)?.name)
      .filter((x): x is ProfileName => !!x);

  const toggle = async (n: number) => {
    if (!profileId) return;
    const next = mine.includes(n) ? mine.filter((x) => x !== n) : [...mine, n];
    await upsertExercise<ProgramData>("programa", { semanas: next }, profileId);
    refresh();
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Programa de 8 semanas</h3>
        <ProgressRing value={mine.length} total={PROGRAM_WEEKS.length} size={40} strokeWidth={4.5} />
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Una masterclass por semana. Marca la tuya cuando la completéis.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {PROGRAM_WEEKS.map((w) => {
          const done = mine.includes(w.numero);
          const open = openWeek === w.numero;
          const did = whoDid(w.numero);
          return (
            <div key={w.numero} className="overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-800/60">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <button
                  onClick={() => toggle(w.numero)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
                    done ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {done ? "✓" : ""}
                </button>
                <button onClick={() => setOpenWeek(open ? null : w.numero)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                    {w.numero}
                  </span>
                  <span className="truncate text-sm text-zinc-700 dark:text-zinc-200">{w.titulo}</span>
                </button>
                <span className="flex shrink-0 items-center gap-1">
                  {did.map((n) => (
                    <MiniAvatar key={n} name={n} />
                  ))}
                  <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
                </span>
              </div>
              {open && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm dark:border-zinc-700/50">
                  <p className="text-zinc-600 dark:text-zinc-300">
                    <span className="font-medium">Objetivo:</span> {w.objetivo}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 pl-4">
                    {w.contenido.map((c, i) => (
                      <li key={i} className="list-disc text-zinc-500 dark:text-zinc-400">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                    <p className="text-xs italic text-amber-800 dark:text-amber-300">💡 {w.ejercicio}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
