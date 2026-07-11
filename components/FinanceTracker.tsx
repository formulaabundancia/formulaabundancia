"use client";

import { useEffect, useState } from "react";
import {
  addFinanceEntry,
  addFinanceGoal,
  deleteFinanceEntry,
  deleteFinanceGoal,
  getFinanceEntries,
  getFinanceGoals,
  updateFinanceGoalAmount,
} from "@/lib/storage";
import { FinanceEntry, FinanceGoal, FinanceScope, FinanceTipo, PROFILE_DISPLAY_NAMES, ProfileId, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

function formatMoney(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function FinanceTracker({
  scope,
  title = "Balance",
}: {
  scope: FinanceScope;
  title?: string;
}) {
  const { profileId, allProfiles } = useProfile();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [tipo, setTipo] = useState<FinanceTipo>("gasto");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [goalNombre, setGoalNombre] = useState("");
  const [goalMonto, setGoalMonto] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const refresh = () => {
    getFinanceEntries(scope).then(setEntries);
    getFinanceGoals(scope).then(setGoals);
  };

  const profileName = (id: ProfileId) =>
    PROFILE_DISPLAY_NAMES[allProfiles.find((p) => p.id === id)?.name ?? "jose"];

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(monto);
    if (!profileId || Number.isNaN(value) || value <= 0 || !descripcion.trim()) return;
    await addFinanceEntry(scope, tipo, value, descripcion.trim(), profileId, visibility);
    setMonto("");
    setDescripcion("");
    refresh();
  };

  const submitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(goalMonto);
    if (!goalNombre.trim() || Number.isNaN(value) || value <= 0 || !profileId) return;
    await addFinanceGoal(scope, goalNombre.trim(), value, profileId, "shared");
    setGoalNombre("");
    setGoalMonto("");
    refresh();
  };

  if (!mounted) return null;

  const balance = entries.reduce((acc, e) => acc + (e.tipo === "ingreso" ? e.monto : -e.monto), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-amber-800 dark:text-amber-300">
          {formatMoney(balance)}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Añadir movimiento</h3>
        <form onSubmit={submitEntry} className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipo("gasto")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${
                tipo === "gasto"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setTipo("ingreso")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${
                tipo === "ingreso"
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Ingreso
            </button>
          </div>
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Importe (€)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="flex items-center justify-between gap-2">
            <VisibilityToggle value={visibility} onChange={setVisibility} />
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Guardar
            </button>
          </div>
        </form>

        {entries.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {entries.slice(0, 10).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"
              >
                <span className="text-zinc-700 dark:text-zinc-200">
                  {e.visibility === "private" ? "🔒 " : ""}
                  {e.descripcion} · {profileName(e.ownerId)}
                </span>
                <span className="flex items-center gap-2">
                  <span className={e.tipo === "ingreso" ? "text-emerald-600" : "text-red-500"}>
                    {e.tipo === "ingreso" ? "+" : "-"}
                    {formatMoney(e.monto)}
                  </span>
                  {e.ownerId === profileId && (
                    <button
                      onClick={() => deleteFinanceEntry(e.id).then(refresh)}
                      className="text-zinc-400 hover:text-red-500"
                      aria-label="Eliminar"
                    >
                      ✕
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Metas de ahorro</h3>
        <form onSubmit={submitGoal} className="mt-4 flex gap-2">
          <input
            value={goalNombre}
            onChange={(e) => setGoalNombre(e.target.value)}
            placeholder="Nombre de la meta"
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            value={goalMonto}
            onChange={(e) => setGoalMonto(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Objetivo €"
            className="w-28 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            +
          </button>
        </form>

        {goals.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.montoActual / g.montoObjetivo) * 100));
              return (
                <li key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-200">{g.nombre}</span>
                    <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      {formatMoney(g.montoActual)} / {formatMoney(g.montoObjetivo)}
                      <button
                        onClick={() => deleteFinanceGoal(g.id).then(refresh)}
                        className="text-zinc-400 hover:text-red-500"
                        aria-label="Eliminar"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={g.montoObjetivo}
                    step="1"
                    value={g.montoActual}
                    onChange={(e) => updateFinanceGoalAmount(g.id, Number(e.target.value)).then(refresh)}
                    className="mt-1 w-full"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
