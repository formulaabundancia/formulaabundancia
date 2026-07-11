"use client";

import { Header } from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";
import { DYLAN_BLOCKS } from "@/lib/sections";

export default function DylanPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">💙 Dylan</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Todo lo relacionado con Dylan, en un solo sitio.
          </p>

          <div className="mt-6 flex flex-col gap-8">
            {DYLAN_BLOCKS.map(({ title, block }, i) => (
              <section key={i}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {title}
                </h2>
                <BlockRenderer block={block} />
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
