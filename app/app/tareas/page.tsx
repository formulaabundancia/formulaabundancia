"use client";

import { Header } from "@/components/Header";
import { ListBlock } from "@/components/ListBlock";
import { ChecklistIcon } from "@/components/icons";

export default function TareasPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <ChecklistIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Tareas de la casa</h1>
          </div>
          <div className="mt-5">
            <ListBlock blockKey="tareas-casa" title="Pendientes" allowAssign itemLabel="Nueva tarea" />
          </div>
        </div>
      </main>
    </>
  );
}
