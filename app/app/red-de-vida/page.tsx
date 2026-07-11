"use client";

import { Header } from "@/components/Header";
import { LifeContacts } from "@/components/LifeContacts";

export default function RedDeVidaPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">🌐 Red de la vida</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Amigos y familia — cuánto hace que no los ves.
          </p>
          <div className="mt-5">
            <LifeContacts />
          </div>
        </div>
      </main>
    </>
  );
}
