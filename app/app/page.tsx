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
  const [today, setToday] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (profileId) getTodayProgress(profileId, RITUAL_STEP_KEYS, RITUALS.length).then(setToday);
  }, [profileId]);

  return (
    <div className="mb-6 rounded-3xl bg-zinc-900 p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">Meta diaria</p>
          <p className="mt-1 text-xl font-bold text-white">
            {profile ? `Hola, ${PROFILE_DISPLAY_NAMES[profile.name]}` : "Hola"}
          </p>
        </div>
        {today ? (
          <ProgressRing value={today.done} total={today.total} size={68} strokeWidth={6} sublabel="hoy" inverted />
        ) : (
          <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-white/10" />
        )}
      </div>
      <div className="mt-5 rounded-2xl bg-white/10 p-3">
        <WeekStrip inverted />
      </div>
    </div>
  );
}

const AREA_STYLES: Record<Area, { card: string; iconBg: string }> = {
  salud: {
    card: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-200/70 dark:bg-emerald-900/60",
  },
  dinero: {
    card: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-200/70 dark:bg-amber-900/60",
  },
  amor: {
    card: "bg-rose-50 dark:bg-rose-950/30",
    iconBg: "bg-rose-200/70 dark:bg-rose-900/60",
  },
};

const ADULT_LINKS = [
  { href: "/app/dylan", icon: "💙", label: "Dylan", card: "bg-sky-50 dark:bg-sky-950/30", iconBg: "bg-sky-200/70 dark:bg-sky-900/60" },
  {
    href: "/app/red-de-vida",
    icon: "🌐",
    label: "Red de la vida",
    card: "bg-violet-50 dark:bg-violet-950/30",
    iconBg: "bg-violet-200/70 dark:bg-violet-900/60",
  },
  {
    href: "/app/respiracion",
    icon: "🫁",
    label: "Respiración",
    card: "bg-cyan-50 dark:bg-cyan-950/30",
    iconBg: "bg-cyan-200/70 dark:bg-cyan-900/60",
  },
  {
    href: "/app/recetas",
    icon: "🍽️",
    label: "Recetas",
    card: "bg-orange-50 dark:bg-orange-950/30",
    iconBg: "bg-orange-200/70 dark:bg-orange-900/60",
  },
];

const CHILD_LINKS = [
  {
    href: "/app/respiracion",
    icon: "🫁",
    label: "Respiración",
    card: "bg-cyan-50 dark:bg-cyan-950/30",
    iconBg: "bg-cyan-200/70 dark:bg-cyan-900/60",
  },
];

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
                className={`flex flex-col gap-3 rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.card}`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${link.iconBg}`}>
                  {link.icon}
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{link.label}</span>
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
                          className={`flex flex-col gap-2 rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
                        >
                          <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${styles.iconBg}`}>
                            {dim.icon}
                          </span>
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{dim.label}</span>
                          <p className="text-xs leading-snug text-zinc-600 dark:text-zinc-400">{section.subtitle}</p>
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
