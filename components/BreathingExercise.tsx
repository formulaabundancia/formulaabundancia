"use client";

import { useEffect, useState } from "react";

interface Phase {
  name: string;
  seconds: number;
  scale: number; // tamaño del círculo en esta fase
}

interface Technique {
  key: string;
  label: string;
  description: string;
  phases: Phase[];
}

const TECHNIQUES: Technique[] = [
  {
    key: "4-7-8",
    label: "4-7-8",
    description: "Relajación profunda — ideal para dormir",
    phases: [
      { name: "Inhala", seconds: 4, scale: 1 },
      { name: "Mantén", seconds: 7, scale: 1 },
      { name: "Exhala", seconds: 8, scale: 0.55 },
    ],
  },
  {
    key: "4-4-4",
    label: "4-4-4",
    description: "Respiración de caja — calma y equilibrio",
    phases: [
      { name: "Inhala", seconds: 4, scale: 1 },
      { name: "Mantén", seconds: 4, scale: 1 },
      { name: "Exhala", seconds: 4, scale: 0.55 },
    ],
  },
];

export function BreathingExercise() {
  const [technique, setTechnique] = useState<Technique>(TECHNIQUES[0]);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(technique.phases[0].seconds);
  const [cycles, setCycles] = useState(0);

  const currentPhase = technique.phases[phaseIndex];

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // pasar a la siguiente fase
        setPhaseIndex((i) => {
          const nextIndex = (i + 1) % technique.phases.length;
          if (nextIndex === 0) setCycles((c) => c + 1);
          return nextIndex;
        });
        return -1; // se corrige abajo
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, technique]);

  useEffect(() => {
    if (secondsLeft === -1) setSecondsLeft(technique.phases[phaseIndex].seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex]);

  const start = (t: Technique) => {
    setTechnique(t);
    setPhaseIndex(0);
    setSecondsLeft(t.phases[0].seconds);
    setCycles(0);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setPhaseIndex(0);
    setCycles(0);
    setSecondsLeft(technique.phases[0].seconds);
  };

  if (!running) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Elige una técnica</h3>
        <div className="mt-4 flex flex-col gap-3">
          {TECHNIQUES.map((t) => (
            <button
              key={t.key}
              onClick={() => start(t)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30"
            >
              <p className="font-medium text-zinc-800 dark:text-zinc-100">{t.label}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="flex h-56 w-56 items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 text-white shadow-lg transition-all duration-1000 ease-in-out dark:from-emerald-600 dark:to-emerald-800"
            style={{
              width: `${140 * currentPhase.scale}px`,
              height: `${140 * currentPhase.scale}px`,
            }}
          >
            <span className="text-3xl font-semibold">{secondsLeft > 0 ? secondsLeft : currentPhase.seconds}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{currentPhase.name}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {technique.label} · ciclo {cycles + 1}
          </p>
        </div>
        <button
          onClick={stop}
          className="rounded-xl bg-zinc-100 px-6 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Detener
        </button>
      </div>
    </div>
  );
}
