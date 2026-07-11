"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { AREAS, DIMENSIONS, SECTIONS } from "@/lib/sections";
import { Area } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

const AREA_STYLES: Record<Area, { card: string; badge: string }> = {
  salud: {
    card: "border-emerald-200 hover:border-emerald-300 dark:border-emerald-900 dark:hover:border-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  dinero: {
    card: "border-amber-200 hover:border-amber-300 dark:border-amber-900 dark:hover:border-amber-700",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  amor: {
    card: "border-rose-200 hover:border-rose-300 dark:border-rose-900 dark:hover:border-rose-700",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
};

const ADULT_LINKS = [
  { href: "/app/dylan", label: "💙 Dylan" },
  { href: "/app/tareas", label: "🏠 Tareas de la casa" },
  { href: "/app/red-de-vida", label: "🌐 Red de la vida" },
  { href: "/app/respiracion", label: "🫁 Respiración" },
  { href: "/app/libreria", label: "📚 Librería de hábitos" },
  { href: "/app/estadisticas", label: "📊 Estadísticas" },
];

const CHILD_LINKS = [
  { href: "/app/dylan", label: "💙 Mi sección" },
  { href: "/app/tareas", label: "🏠 Tareas de la casa" },
  { href: "/app/red-de-vida", label: "🌐 Red de la vida" },
  { href: "/app/respiracion", label: "🫁 Respiración" },
];

export default function HomePage() {
  const { profile } = useProfile();
  const isChild = profile?.role === "child";

  return (
    <>
      <Header />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex flex-col gap-3">
            {(isChild ? CHILD_LINKS : ADULT_LINKS).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-100">{link.label}</span>
                <span className="text-zinc-400">→</span>
              </Link>
            ))}
          </div>

          {!isChild &&
            AREAS.map((area) => (
              <div key={area.id} className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {area.label}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {DIMENSIONS.map((dim) => {
                    const section = SECTIONS.find((s) => s.area === area.id && s.dimension === dim.id);
                    if (!section) return null;
                    const styles = AREA_STYLES[area.id];
                    return (
                      <Link
                        key={dim.id}
                        href={`/app/${area.id}/${dim.id}`}
                        className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-zinc-900 ${styles.card}`}
                      >
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                          {dim.label}
                        </span>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{section.subtitle}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </main>
    </>
  );
}
