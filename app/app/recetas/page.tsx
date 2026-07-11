"use client";

import { Header } from "@/components/Header";
import { RecipeBook } from "@/components/RecipeBook";
import { UtensilsIcon } from "@/components/icons";

export default function RecetasPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <UtensilsIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Recetas</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Comida murciana y española.</p>
          <div className="mt-5">
            <RecipeBook />
          </div>
        </div>
      </main>
    </>
  );
}
