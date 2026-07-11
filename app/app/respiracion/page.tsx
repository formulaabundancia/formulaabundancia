"use client";

import { Header } from "@/components/Header";
import { BreathingExercise } from "@/components/BreathingExercise";

export default function RespiracionPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">🫁 Respiración</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Elige una técnica y sigue el círculo — inhala cuando crece, exhala cuando encoge.
          </p>
          <div className="mt-5">
            <BreathingExercise />
          </div>
        </div>
      </main>
    </>
  );
}
