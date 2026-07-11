"use client";

import { useEffect, useState } from "react";
import { addLogEntry, deleteLogEntry, getLogs } from "@/lib/storage";
import { LogEntry, PROFILE_DISPLAY_NAMES, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

export interface LogBlockProps {
  blockKey: string;
  title: string;
  categorias: string[];
  trackMonto?: boolean;
  placeholder?: string;
}

export function LogBlock({ blockKey, title, categorias, trackMonto, placeholder }: LogBlockProps) {
  const { profileId, allProfiles } = useProfile();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [categoria, setCategoria] = useState(categorias[0]);
  const [nota, setNota] = useState("");
  const [monto, setMonto] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const refresh = () => getLogs(blockKey).then(setEntries);

  const profileName = (id: string) => PROFILE_DISPLAY_NAMES[allProfiles.find((p) => p.id === id)?.name ?? "jose"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId || !nota.trim()) return;
    const montoValue = trackMonto && monto ? parseFloat(monto) : undefined;
    await addLogEntry(blockKey, categoria, nota.trim(), profileId, visibility, montoValue);
    setNota("");
    setMonto("");
    refresh();
  };

  if (!mounted) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{title}</h3>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        {categorias.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  categoria === c
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder={placeholder ?? "Escribe algo..."}
          rows={3}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {trackMonto && (
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Importe (€) — opcional"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <VisibilityToggle value={visibility} onChange={setVisibility} />
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Guardar
          </button>
        </div>
      </form>

      {entries.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {entries.slice(0, 10).map((entry) => (
            <li key={entry.id} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {entry.visibility === "private" ? "🔒 " : ""}
                  {categorias.length > 1 ? `${entry.categoria} · ` : ""}
                  {profileName(entry.ownerId)} · {entry.date}
                </span>
                {entry.ownerId === profileId && (
                  <button
                    onClick={() => {
                      deleteLogEntry(entry.id).then(refresh);
                    }}
                    className="text-zinc-400 hover:text-red-500"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                {entry.nota}
                {entry.monto ? ` (${entry.monto.toLocaleString("es-ES")}€)` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
