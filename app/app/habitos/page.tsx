"use client";

import { Header } from "@/components/Header";
import { RitualBlock } from "@/components/RitualBlock";
import { ChecklistIcon } from "@/components/icons";

export default function HabitosPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <ChecklistIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Hábitos diarios</h1>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <RitualBlock ritualKey="manana" />
            <RitualBlock ritualKey="noche" />
            <RitualBlock ritualKey="bienestar" />
            <RitualBlock ritualKey="skincare" />
            <RitualBlock ritualKey="pareja_manana" />
            <RitualBlock ritualKey="pareja_noche" />
          </div>
        </div>
      </main>
    </>
  );
}
