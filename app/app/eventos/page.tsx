"use client";

import { Header } from "@/components/Header";
import { EventList } from "@/components/EventList";
import { CalendarIcon } from "@/components/icons";

export default function EventosPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Eventos</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Cumbres, retiros y citas que no os queréis perder.</p>
          <div className="mt-5">
            <EventList />
          </div>
        </div>
      </main>
    </>
  );
}
