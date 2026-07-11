"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";
import { getSection } from "@/lib/sections";

export default function SectionPage() {
  const params = useParams<{ area: string; dimension: string }>();
  const section = getSection(params.area, params.dimension);

  if (!section) {
    return (
      <>
        <Header backHref="/app" />
        <main className="flex-1 px-5 py-6">
          <p className="text-sm text-zinc-500">Sección no encontrada.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{section.title}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{section.subtitle}</p>

          <div className="mt-6 flex flex-col gap-5">
            {section.blocks.map((block, i) => (
              <BlockRenderer key={i} block={block} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
