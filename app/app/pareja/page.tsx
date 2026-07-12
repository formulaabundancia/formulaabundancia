"use client";

import { Header } from "@/components/Header";
import { DreamsBoard } from "@/components/DreamsBoard";
import { OkrPlan } from "@/components/OkrPlan";
import { NoNegociablesBoard } from "@/components/NoNegociablesBoard";
import { RewardsBoard } from "@/components/RewardsBoard";
import { RingsIcon } from "@/components/icons";

export default function ParejaPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <RingsIcon className="h-5 w-5 text-rose-500" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Pareja</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sueños, plan de 90 días, no negociables y premios que os ganáis juntos.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <DreamsBoard />
            <OkrPlan />
            <NoNegociablesBoard />
            <RewardsBoard />
          </div>
        </div>
      </main>
    </>
  );
}
