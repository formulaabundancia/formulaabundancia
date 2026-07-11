"use client";

import Link from "next/link";
import { useProfile } from "@/lib/profile-context";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";

export function Header({ backHref }: { backHref?: string }) {
  const { profile, logout } = useProfile();
  const name = profile ? PROFILE_DISPLAY_NAMES[profile.name] : "";

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Atrás
          </Link>
        ) : (
          <Link href="/app" className="font-semibold text-zinc-900 dark:text-zinc-50">
            Fórmula Abundancia
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">Hola, {name}</span>
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
