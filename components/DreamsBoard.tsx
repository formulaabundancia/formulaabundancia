"use client";

import { useEffect, useState } from "react";
import { addDream, deleteDream, getDreams, toggleDreamConseguido, updateDream } from "@/lib/storage";
import { Dream, DreamHorizon, DreamTipo } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { StarIcon } from "@/components/icons";

const HORIZONS: { value: DreamHorizon; label: string }[] = [
  { value: 1, label: "A 1 año" },
  { value: 5, label: "A 5 años" },
  { value: 10, label: "A 10 años" },
];

function DreamRow({ dream, onChange }: { dream: Dream; onChange: () => void }) {
  const { profileId } = useProfile();
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(dream.texto);

  const save = async () => {
    if (texto.trim()) await updateDream(dream.id, { texto: texto.trim() });
    setEditing(false);
    onChange();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
        />
        <button onClick={save} className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Guardar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
      <button onClick={() => toggleDreamConseguido(dream.id, dream.conseguido).then(onChange)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
            dream.conseguido ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {dream.conseguido ? "✓" : ""}
        </span>
        <span className={`truncate text-sm ${dream.conseguido ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-200"}`}>
          {dream.texto}
        </span>
      </button>
      <span className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            dream.tipo === "pareja"
              ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300"
          }`}
        >
          {dream.tipo === "pareja" ? "Pareja" : "Individual"}
        </span>
        {dream.ownerId === profileId && (
          <>
            <button onClick={() => setEditing(true)} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              ✎
            </button>
            <button onClick={() => deleteDream(dream.id).then(onChange)} className="text-zinc-400 hover:text-red-500">
              ✕
            </button>
          </>
        )}
      </span>
    </div>
  );
}

export function DreamsBoard() {
  const { profileId } = useProfile();
  const [dreams, setDreams] = useState<Dream[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [texto, setTexto] = useState("");
  const [horizonte, setHorizonte] = useState<DreamHorizon>(1);
  const [tipo, setTipo] = useState<DreamTipo>("pareja");

  const refresh = () => getDreams().then(setDreams);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !profileId) return;
    await addDream(texto.trim(), horizonte, tipo, profileId, "shared");
    setTexto("");
    setShowForm(false);
    refresh();
  };

  if (!dreams) return null;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <StarIcon className="h-5 w-5 text-violet-500" />
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Sueños compartidos</h3>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Vuestro panel de sueños a 1, 5 y 10 años — individuales y de pareja.
      </p>

      <button
        onClick={() => setShowForm((s) => !s)}
        className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir sueño"}
      </button>

      {showForm && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: vivir 3 meses en la playa juntos"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <div className="flex gap-2">
            <select
              value={horizonte}
              onChange={(e) => setHorizonte(Number(e.target.value) as DreamHorizon)}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {HORIZONS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as DreamTipo)}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="pareja">De pareja</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <button type="submit" className="mt-1 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
            Guardar
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {HORIZONS.map((h) => {
          const items = dreams.filter((d) => d.horizonte === h.value);
          if (items.length === 0) return null;
          return (
            <div key={h.value}>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">{h.label}</h4>
              <div className="flex flex-col gap-2">
                {items.map((d) => (
                  <DreamRow key={d.id} dream={d} onChange={refresh} />
                ))}
              </div>
            </div>
          );
        })}
        {dreams.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay sueños — empieza a soñar en grande.</p>
        )}
      </div>
    </div>
  );
}
