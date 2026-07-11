"use client";

import Link from "next/link";
import { useProfile } from "@/lib/profile-context";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { AppLogo } from "@/components/AppLogo";
import { useTheme } from "@/lib/theme-context";
import { MoonIcon, SunIcon } from "@/components/icons";

export function Header({ backHref }: { backHref?: string }) {
  const { profile, logout } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const name = profile ? PROFILE_DISPLAY_NAMES[profile.name] : "";

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-5 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Atrás
          </Link>
        ) : (
          <Link href="/app" className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">Fórmula Abundancia</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden text-zinc-500 dark:text-zinc-400 sm:inline">
          Hola, <span className="font-medium text-zinc-900 dark:text-zinc-100">{name}</span>
        </span>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
        </button>
        <button
          onClick={logout}
          className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          salir
        </button>
      </div>
    </header>
  );
}
