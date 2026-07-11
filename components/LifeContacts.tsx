"use client";

import { useEffect, useState } from "react";
import { addLifeContact, deleteLifeContact, getLifeContacts, isOverdue, markContacted } from "@/lib/storage";
import { LifeContact, Relacion, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

const RELACIONES: { id: Relacion; label: string }[] = [
  { id: "amigo", label: "Amigo" },
  { id: "familia", label: "Familia" },
];

function daysAgo(date: string | null): string {
  if (!date) return "nunca";
  const diff = Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "hoy";
  if (diff === 1) return "hace 1 día";
  return `hace ${diff} días`;
}

export function LifeContacts() {
  const { profileId } = useProfile();
  const [contacts, setContacts] = useState<LifeContact[]>([]);
  const [nombre, setNombre] = useState("");
  const [relacion, setRelacion] = useState<Relacion>("amigo");
  const [cadencia, setCadencia] = useState("14");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const refresh = () => getLifeContacts().then(setContacts);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dias = parseInt(cadencia, 10);
    if (!nombre.trim() || Number.isNaN(dias) || dias <= 0 || !profileId) return;
    await addLifeContact(nombre.trim(), relacion, dias, profileId, visibility);
    setNombre("");
    setCadencia("14");
    refresh();
  };

  if (!mounted) return null;

  const sorted = contacts.slice().sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Personas</h3>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={relacion}
            onChange={(e) => setRelacion(e.target.value as Relacion)}
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {RELACIONES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            value={cadencia}
            onChange={(e) => setCadencia(e.target.value)}
            type="number"
            min={1}
            placeholder="Cada X días"
            className="w-28 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <VisibilityToggle value={visibility} onChange={setVisibility} />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            +
          </button>
        </div>
      </form>

      {sorted.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {sorted.map((c) => {
            const overdue = isOverdue(c);
            return (
              <li
                key={c.id}
                className={`rounded-xl border px-4 py-3 ${
                  overdue
                    ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {c.visibility === "private" ? "🔒 " : ""}
                      {c.nombre}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.relacion === "amigo" ? "Amigo" : "Familia"} · cada {c.cadenciaDias} días · último contacto:{" "}
                      {daysAgo(c.ultimoContacto)}
                      {overdue ? " · ⚠️ toca contactar" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markContacted(c.id).then(refresh)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                    >
                      Contactado hoy
                    </button>
                    {c.ownerId === profileId && (
                      <button
                        onClick={() => deleteLifeContact(c.id).then(refresh)}
                        className="text-zinc-400 hover:text-red-500"
                        aria-label="Eliminar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
