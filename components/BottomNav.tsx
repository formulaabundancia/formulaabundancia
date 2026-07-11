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
    <div className="sticky bottom-0 z-30 px-4 pb-4 pt-2">
      <nav className="flex rounded-full bg-white/95 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:bg-zinc-900/95 dark:ring-white/10">
        {items.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-medium transition ${
                active ? "bg-zinc-900 dark:bg-white" : ""
              }`}
            >
              <span className={`text-lg transition ${active ? "" : "opacity-50"}`}>{item.icon}</span>
              <span className={active ? "text-white dark:text-zinc-900" : "text-zinc-400 dark:text-zinc-500"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
