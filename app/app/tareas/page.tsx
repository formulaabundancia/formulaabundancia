"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ListBlock } from "@/components/ListBlock";
import { TaskStats } from "@/components/TaskStats";
import { ChecklistIcon } from "@/components/icons";

export default function TareasPage() {
  const [statsVersion, setStatsVersion] = useState(0);

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <ChecklistIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Tareas de la casa</h1>
          </div>
          <div className="mt-5 flex flex-col gap-4">
            <TaskStats blockKey="tareas-casa" refreshKey={statsVersion} />
            <ListBlock
              blockKey="tareas-casa"
              title="Pendientes"
              allowAssign
              allowCategory
              dailyReset
              logCompletions
              onCompletion={() => setStatsVersion((v) => v + 1)}
              itemLabel="Nueva tarea"
            />
          </div>
        </div>
      </main>
    </>
  );
}
