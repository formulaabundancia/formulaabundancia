"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/lib/profile-context";

const ADULT_ITEMS = [
  { href: "/app", icon: "🏡", label: "Inicio" },
  { href: "/app/estadisticas", icon: "📊", label: "Progreso" },
  { href: "/app/libreria", icon: "📚", label: "Librería" },
  { href: "/app/tareas", icon: "🏠", label: "Tareas" },
];

const CHILD_ITEMS = [
  { href: "/app", icon: "🏡", label: "Inicio" },
  { href: "/app/dylan", icon: "💙", label: "Mi sección" },
  { href: "/app/tareas", icon: "🏠", label: "Tareas" },
  { href: "/app/red-de-vida", icon: "🌐", label: "Familia" },
];

export function BottomNav() {
  const { profileId, profile } = useProfile();
  const pathname = usePathname();

  if (!profileId) return null;
  const items = profile?.role === "child" ? CHILD_ITEMS : ADULT_ITEMS;

  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      {items.map((item) => {
        const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
          >
            <span
              className={`text-lg transition ${active ? "" : "opacity-50"}`}
            >
              {item.icon}
            </span>
            <span className={active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
