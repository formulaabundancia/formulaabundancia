"use client";

import { Header } from "@/components/Header";
import { RecipeBook } from "@/components/RecipeBook";

export default function RecetasPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">🍽️ Recetas</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Comida murciana y española.</p>
          <div className="mt-5">
            <RecipeBook />
          </div>
        </div>
      </main>
    </>
  );
}
