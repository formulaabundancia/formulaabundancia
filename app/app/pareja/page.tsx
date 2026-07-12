"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { DreamsBoard } from "@/components/DreamsBoard";
import { OkrPlan } from "@/components/OkrPlan";
import { NoNegociablesBoard } from "@/components/NoNegociablesBoard";
import { RewardsBoard } from "@/components/RewardsBoard";
import { BookIcon, RingsIcon } from "@/components/icons";

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
            <Link
              href="/app/pareja/programa"
              className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
                  <BookIcon className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Programa de mentoría</p>
                  <p className="mt-0.5 text-base font-bold text-white">8 semanas + ejercicios guiados</p>
                </div>
              </div>
              <span className="text-2xl text-white/80">→</span>
            </Link>
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
