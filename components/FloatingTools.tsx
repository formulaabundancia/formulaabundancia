"use client";

import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/lib/profile-context";
import { addWorkSession } from "@/lib/storage";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function PomodoroTab() {
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase((p) => (p === "focus" ? "break" : "focus"));
          return phase === "focus" ? BREAK_SECONDS : FOCUS_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phase]);

  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS_SECONDS);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          phase === "focus"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        }`}
      >
        {phase === "focus" ? "Enfoque" : "Descanso"}
      </span>
      <p className="font-mono text-5xl font-semibold text-zinc-900 dark:text-zinc-50">
        {formatTime(secondsLeft)}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {running ? "Pausar" : "Empezar"}
        </button>
        <button
          onClick={reset}
          className="rounded-xl bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}

function CronometroTab() {
  const { profileId } = useProfile();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const guardar = () => {
    if (!profileId || seconds < 60) return;
    addWorkSession(profileId, seconds / 60);
    setSeconds(0);
    setRunning(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="font-mono text-5xl font-semibold text-zinc-900 dark:text-zinc-50">
        {formatTime(seconds)}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {running ? "Pausar" : "Empezar"}
        </button>
        <button
          onClick={guardar}
          className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          Guardar sesión
        </button>
      </div>
      {saved && <p className="text-xs text-emerald-600 dark:text-emerald-400">Sesión guardada ✓</p>}
    </div>
  );
}

export function FloatingTools() {
  const { profileId } = useProfile();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pomodoro" | "cronometro">("pomodoro");
  const panelRef = useRef<HTMLDivElement>(null);

  if (!profileId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl text-white shadow-lg transition hover:scale-105 dark:bg-zinc-100 dark:text-zinc-900"
        aria-label="Herramientas"
      >
        ⏱️
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-xl dark:bg-zinc-900 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("pomodoro")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    tab === "pomodoro"
                      ? "bg-brand-500 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => setTab("cronometro")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    tab === "cronometro"
                      ? "bg-brand-500 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  Cronómetro
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {tab === "pomodoro" ? <PomodoroTab /> : <CronometroTab />}
          </div>
        </div>
      )}
    </>
  );
}
