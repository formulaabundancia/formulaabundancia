"use client";

import { Header } from "@/components/Header";
import { ProgramChecklist } from "@/components/ProgramChecklist";
import { GuidedExercises } from "@/components/GuidedExercises";
import { BookIcon } from "@/components/icons";

export default function ProgramaPage() {
  return (
    <>
      <Header backHref="/app/pareja" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <BookIcon className="h-5 w-5 text-rose-500" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Programa de mentoría</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            8 semanas para alinearos en sueños, motivaciones y no negociables, con ejercicios guiados.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <ProgramChecklist />
            <h2 className="mt-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Ejercicios guiados
            </h2>
            <GuidedExercises />
          </div>
        </div>
      </main>
    </>
  );
}
