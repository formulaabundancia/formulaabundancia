"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { WeekStrip } from "@/components/WeekStrip";
import { RitualBlock } from "@/components/RitualBlock";
import {
  BrainIcon,
  CoinIcon,
  FeatherIcon,
  DumbbellIcon,
  GlobeIcon,
  HeartIcon,
  LeafIcon,
  SparklesIcon,
  UtensilsIcon,
  WindIcon,
} from "@/components/icons";
import { AREAS, DIMENSIONS, SECTIONS } from "@/lib/sections";
import { Area, Dimension, PROFILE_DISPLAY_NAMES } from "@/lib/types";
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

const AREA_ICONS: Record<Area, React.ComponentType<{ className?: string }>> = {
  salud: LeafIcon,
  dinero: CoinIcon,
  amor: HeartIcon,
};

const AREA_ACCENT: Record<Area, string> = {
  salud: "text-emerald-600 dark:text-emerald-400",
  dinero: "text-amber-600 dark:text-amber-400",
  amor: "text-rose-600 dark:text-rose-400",
};

const AREA_BLOCK: Record<Area, string> = {
  salud: "bg-emerald-500",
  dinero: "bg-amber-500",
  amor: "bg-rose-500",
};

const DIMENSION_ICONS: Record<Dimension, React.ComponentType<{ className?: string }>> = {
  cuerpo: DumbbellIcon,
  alma: SparklesIcon,
  mente: BrainIcon,
  espiritu: FeatherIcon,
};

const ADULT_LINKS = [
  { href: "/app/dylan", Icon: HeartIcon, label: "Dylan", block: "bg-sky-500" },
  { href: "/app/red-de-vida", Icon: GlobeIcon, label: "Red de la vida", block: "bg-violet-500" },
  { href: "/app/respiracion", Icon: WindIcon, label: "Respiración", block: "bg-cyan-500" },
  { href: "/app/recetas", Icon: UtensilsIcon, label: "Recetas", block: "bg-orange-500" },
];

const CHILD_LINKS = [{ href: "/app/respiracion", Icon: WindIcon, label: "Respiración", block: "bg-cyan-500" }];

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
                className={`flex flex-col gap-3 rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.block}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
                  <link.Icon className="h-5 w-5 text-white" />
                </span>
                <span className="text-sm font-semibold text-white">{link.label}</span>
              </Link>
            ))}
          </div>

          {!isChild &&
            AREAS.map((area) => {
              const AreaIcon = AREA_ICONS[area.id];
              const accent = AREA_ACCENT[area.id];
              const block = AREA_BLOCK[area.id];
              return (
                <div key={area.id} className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <AreaIcon className={`h-4 w-4 ${accent}`} />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {area.label}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DIMENSIONS.map((dim) => {
                      const section = SECTIONS.find((s) => s.area === area.id && s.dimension === dim.id);
                      if (!section) return null;
                      const DimIcon = DIMENSION_ICONS[dim.id];
                      return (
                        <Link
                          key={dim.id}
                          href={`/app/${area.id}/${dim.id}`}
                          className={`flex flex-col gap-2 rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${block}`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
                            <DimIcon className="h-5 w-5 text-white" />
                          </span>
                          <span className="text-sm font-semibold text-white">{dim.label}</span>
                          <p className="text-xs leading-snug text-white/80">{section.subtitle}</p>
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
