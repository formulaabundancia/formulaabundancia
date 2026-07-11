"use client";

import { Header } from "@/components/Header";
import { HabitLibrary } from "@/components/HabitLibrary";

export default function LibreriaPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">📚 Librería de hábitos</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Hábitos que podrías incorporar. Acepta el que quieras y aparecerá en su sección.
          </p>
          <div className="mt-5">
            <HabitLibrary />
          </div>
        </div>
      </main>
    </>
  );
}
