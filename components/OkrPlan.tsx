"use client";

import { useEffect, useState } from "react";
import { addOkr, deleteOkr, getOkrs, updateOkr } from "@/lib/storage";
import { Okr, OkrResultado } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";
import { TargetIcon } from "@/components/icons";

function OkrCard({ okr, onChange }: { okr: Okr; onChange: () => void }) {
  const { profileId } = useProfile();
  const [nuevoKr, setNuevoKr] = useState("");
  const done = okr.resultados.filter((r) => r.hecho).length;
  const total = okr.resultados.length;

  const toggleKr = async (idx: number) => {
    const resultados = okr.resultados.map((r, i) => (i === idx ? { ...r, hecho: !r.hecho } : r));
    await updateOkr(okr.id, { resultados });
    onChange();
  };

  const removeKr = async (idx: number) => {
    const resultados = okr.resultados.filter((_, i) => i !== idx);
    await updateOkr(okr.id, { resultados });
    onChange();
  };

  const addKr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoKr.trim()) return;
    const resultados = [...okr.resultados, { texto: nuevoKr.trim(), hecho: false }];
    await updateOkr(okr.id, { resultados });
    setNuevoKr("");
    onChange();
  };

  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProgressRing value={done} total={Math.max(1, total)} size={40} strokeWidth={4.5} />
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{okr.objetivo}</p>
            {okr.fechaFin && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">🎯 hasta {okr.fechaFin}</p>}
          </div>
        </div>
        {okr.ownerId === profileId && (
          <button onClick={() => deleteOkr(okr.id).then(onChange)} className="shrink-0 text-xs text-zinc-400 hover:text-red-500">
            Eliminar
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {okr.resultados.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
            <button onClick={() => toggleKr(idx)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  r.hecho ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {r.hecho ? "✓" : ""}
              </span>
              <span className={`truncate text-sm ${r.hecho ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-200"}`}>
                {r.texto}
              </span>
            </button>
            <button onClick={() => removeKr(idx)} className="shrink-0 text-zinc-400 hover:text-red-500">
              ✕
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addKr} className="mt-2 flex gap-1.5">
        <input
          value={nuevoKr}
          onChange={(e) => setNuevoKr(e.target.value)}
          placeholder="+ Resultado clave"
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
        />
        <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
          +
        </button>
      </form>
    </div>
  );
}

export function OkrPlan() {
  const { profileId } = useProfile();
  const [okrs, setOkrs] = useState<Okr[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [krs, setKrs] = useState("");

  const refresh = () => getOkrs().then(setOkrs);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetivo.trim() || !profileId) return;
    const resultados: OkrResultado[] = krs
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((texto) => ({ texto, hecho: false }));
    await addOkr(objetivo.trim(), resultados, profileId, "shared", fechaFin || undefined);
    setObjetivo("");
    setFechaFin("");
    setKrs("");
    setShowForm(false);
    refresh();
  };

  if (!okrs) return null;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <TargetIcon className="h-5 w-5 text-indigo-500" />
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Plan de 90 días</h3>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Objetivos de pareja con resultados clave. Repasadlo cada viernes.
      </p>

      <button
        onClick={() => setShowForm((s) => !s)}
        className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir objetivo"}
      </button>

      {showForm && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <input
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Objetivo (ej: lanzar nuestro primer producto online)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <textarea
            value={krs}
            onChange={(e) => setKrs(e.target.value)}
            placeholder="Resultados clave, uno por línea"
            rows={3}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <label className="text-xs text-zinc-400">Fecha objetivo (opcional)</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <button type="submit" className="mt-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
            Guardar
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {okrs.map((o) => (
          <OkrCard key={o.id} okr={o} onChange={refresh} />
        ))}
        {okrs.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay objetivos — define el primero de estos 90 días.</p>
        )}
      </div>
    </div>
  );
}
