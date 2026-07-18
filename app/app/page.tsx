"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { WeekStrip } from "@/components/WeekStrip";
import {
  CalendarIcon,
  ChecklistIcon,
  CoinIcon,
  DumbbellIcon,
  FlameIcon,
  GlobeIcon,
  HeartIcon,
  LeafIcon,
  PlayIcon,
  RingsIcon,
  UtensilsIcon,
  WindIcon,
} from "@/components/icons";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { groupStepsByRitual, RITUALS } from "@/lib/rituals";
import { getHabitLogsForKeys, getHabits, getRitualStreak, getTodayProgress, todayStr } from "@/lib/storage";

function TodayHero() {
  const { profile, profileId } = useProfile();
  const [today, setToday] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (!profileId) return;
    getHabits({ status: "active" }).then((habits) => {
      const ritualStepKeys = new Set(habits.filter((h) => h.ritualKey).map((h) => h.key));
      getTodayProgress(profileId, ritualStepKeys, RITUALS.length).then(setToday);
    });
  }, [profileId]);

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 shadow-md">
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

function HabitsBanner() {
  const { profileId } = useProfile();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const habits = await getHabits({ status: "active" });
      const byRitual = groupStepsByRitual(habits);
      const allStepKeys = Object.values(byRitual).flat();
      const [done, streaks] = await Promise.all([
        getHabitLogsForKeys(profileId, allStepKeys, todayStr()),
        Promise.all(Object.values(byRitual).map((keys) => getRitualStreak(keys, profileId))),
      ]);
      setProgress({ done: done.size, total: allStepKeys.length });
      setStreak(Math.max(0, ...streaks));
    })();
  }, [profileId]);

  return (
    <Link
      href="/app/habitos"
      className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
          <ChecklistIcon className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">Hábitos diarios</p>
          <p className="mt-0.5 text-base font-bold text-white">
            {progress ? `${progress.done}/${progress.total} rituales de hoy` : "Rituales de hoy"}
          </p>
          {streak > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/80">
              <FlameIcon className="h-3.5 w-3.5" />
              {streak} {streak === 1 ? "día seguido" : "días seguidos"}
            </p>
          )}
        </div>
      </div>
      {progress && <ProgressRing value={progress.done} total={progress.total} size={52} strokeWidth={6} inverted />}
    </Link>
  );
}

type LinkItem = { href: string; Icon: React.ComponentType<{ className?: string }>; label: string; block: string };

function LinkCard({ link }: { link: LinkItem }) {
  return (
    <Link
      href={link.href}
      className={`flex flex-col gap-3 rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.block}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
        <link.Icon className="h-5 w-5 text-white" />
      </span>
      <span className="text-sm font-semibold text-white">{link.label}</span>
    </Link>
  );
}

const HOME_GROUPS: { titulo: string; links: LinkItem[] }[] = [
  {
    titulo: "Tus áreas",
    links: [
      { href: "/app/salud", Icon: LeafIcon, label: "Salud", block: "bg-emerald-500" },
      { href: "/app/dinero", Icon: CoinIcon, label: "Dinero", block: "bg-amber-500" },
      { href: "/app/amor", Icon: HeartIcon, label: "Amor", block: "bg-rose-500" },
    ],
  },
  {
    titulo: "Vosotros",
    links: [
      { href: "/app/pareja", Icon: RingsIcon, label: "Pareja", block: "bg-rose-500" },
      { href: "/app/entreno", Icon: DumbbellIcon, label: "Entreno", block: "bg-lime-500" },
      { href: "/app/rueda-de-vida", Icon: GlobeIcon, label: "Rueda de la vida", block: "bg-violet-500" },
    ],
  },
  {
    titulo: "Familia",
    links: [
      { href: "/app/dylan", Icon: HeartIcon, label: "Dylan", block: "bg-sky-500" },
      { href: "/app/respiracion", Icon: WindIcon, label: "Respiración", block: "bg-cyan-500" },
    ],
  },
  {
    titulo: "Vuestro contenido",
    links: [
      { href: "/app/recetas", Icon: UtensilsIcon, label: "Recetas", block: "bg-orange-500" },
      { href: "/app/videoteca", Icon: PlayIcon, label: "Videoteca", block: "bg-red-500" },
      { href: "/app/eventos", Icon: CalendarIcon, label: "Eventos", block: "bg-fuchsia-500" },
    ],
  },
];

const CHILD_LINKS: LinkItem[] = [{ href: "/app/respiracion", Icon: WindIcon, label: "Respiración", block: "bg-cyan-500" }];

export default function HomePage() {
  const { profile } = useProfile();
  const isChild = profile?.role === "child";

  if (isChild) {
    return (
      <>
        <Header />
        <main className="flex-1 px-5 py-6">
          <div className="mx-auto max-w-2xl">
            <div className="grid grid-cols-1 gap-3">
              {CHILD_LINKS.map((link) => (
                <LinkCard key={link.href} link={link} />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <TodayHero />
          <HabitsBanner />

          <div className="flex flex-col gap-8">
            {HOME_GROUPS.map((group) => (
              <div key={group.titulo}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {group.titulo}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {group.links.map((link) => (
                    <LinkCard key={link.href} link={link} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
