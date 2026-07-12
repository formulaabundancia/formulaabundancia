"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";
import { DIMENSIONS, getAreaMeta, getSectionsByArea } from "@/lib/sections";

export default function AreaPage() {
  const params = useParams<{ area: string }>();
  const area = getAreaMeta(params.area);
  const sections = getSectionsByArea(params.area);

  if (!area || sections.length === 0) {
    return (
      <>
        <Header backHref="/app" />
        <main className="flex-1 px-5 py-6">
          <p className="text-sm text-zinc-500">Área no encontrada.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">{area.icon}</span>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{area.label}</h1>
          </div>

          <div className="mt-6 flex flex-col gap-8">
            {sections.map((section) => {
              const dim = DIMENSIONS.find((d) => d.id === section.dimension);
              return (
                <div key={section.dimension}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-base">{dim?.icon}</span>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {dim?.label}
                    </h2>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">· {section.subtitle}</span>
                  </div>
                  <div className="flex flex-col gap-5">
                    {section.blocks.map((block, i) => (
                      <BlockRenderer key={i} block={block} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
