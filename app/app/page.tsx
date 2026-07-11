"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { WeekStrip } from "@/components/WeekStrip";
import { RitualBlock } from "@/components/RitualBlock";
import { AREAS, DIMENSIONS, SECTIONS } from "@/lib/sections";
import { Area, PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { RITUALS } from "@/lib/rituals";
import { getTodayProgress } from "@/lib/storage";

const RITUAL_STEP_KEYS = new Set(RITUALS.flatMap((r) => r.steps));

function TodayHero() {
  const { profile, profileId } = useProfile();
  const [today, setToday] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (profileId) getTodayProgress(profileId, RITUAL_STEP_KEYS, RITUALS.length).then(setToday);
  }, [profileId]);

  return (
    <div className="mb-6 rounded-3xl bg-zinc-100 p-5 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Meta diaria</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {profile ? `Hola, ${PROFILE_DISPLAY_NAMES[profile.name]}` : "Hola"}
          </p>
        </div>
        <ProgressRing value={today.done} total={today.total} size={64} strokeWidth={6} sublabel="hoy" />
      </div>
      <div className="mt-5">
        <WeekStrip />
      </div>
    </div>
  );
}

const AREA_STYLES: Record<Area, { card: string; badge: string; iconBg: string }> = {
  salud: {
    card: "border-emerald-200 hover:border-emerald-300 dark:border-emerald-900 dark:hover:border-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  dinero: {
    card: "border-amber-200 hover:border-amber-300 dark:border-amber-900 dark:hover:border-amber-700",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  amor: {
    card: "border-rose-200 hover:border-rose-300 dark:border-rose-900 dark:hover:border-rose-700",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
  },
};

const ADULT_LINKS = [
  { href: "/app/dylan", icon: "💙", label: "Dylan" },
  { href: "/app/red-de-vida", icon: "🌐", label: "Red de la vida" },
  { href: "/app/respiracion", icon: "🫁", label: "Respiración" },
  { href: "/app/recetas", icon: "🍽️", label: "Recetas" },
];

const CHILD_LINKS = [{ href: "/app/respiracion", icon: "🫁", label: "Respiración" }];

export default function HomePage() {
  const { profile } = useProfile();
  const isChild = profile?.role === "child";

  return (
    <>
      <Header />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          {!isChild && <TodayHero />}

          {!isChild && (
            <div className="mb-8 flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Rutinas de hoy
              </h2>
              <RitualBlock ritualKey="manana" />
              <RitualBlock ritualKey="noche" />
            </div>
          )}

          <div className={`mb-8 grid gap-3 ${isChild ? "grid-cols-1" : "grid-cols-2"}`}>
            {(isChild ? CHILD_LINKS : ADULT_LINKS).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-500"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-lg dark:bg-zinc-800">
                  {link.icon}
                </span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{link.label}</span>
              </Link>
            ))}
          </div>

          {!isChild &&
            AREAS.map((area) => {
              const styles = AREA_STYLES[area.id];
              return (
                <div key={area.id} className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${styles.iconBg}`}>
                      {area.icon}
                    </span>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {area.label}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DIMENSIONS.map((dim) => {
                      const section = SECTIONS.find((s) => s.area === area.id && s.dimension === dim.id);
                      if (!section) return null;
                      return (
                        <Link
                          key={dim.id}
                          href={`/app/${area.id}/${dim.id}`}
                          className={`flex flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${styles.card}`}
                        >
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${styles.iconBg}`}>
                            {dim.icon}
                          </span>
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{dim.label}</span>
                          <p className="text-xs leading-snug text-zinc-500 dark:text-zinc-400">{section.subtitle}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </main>
    </>
  );
}
