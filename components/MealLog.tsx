"use client";

import { useEffect, useState } from "react";
import { addMeal, deleteMeal, getMeals } from "@/lib/storage";
import { Meal, MealTipo, PROFILE_DISPLAY_NAMES, ProfileId, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

const TIPOS: { id: MealTipo; label: string }[] = [
  { id: "batido", label: "Batido Herbalife" },
  { id: "comida", label: "Comida" },
  { id: "snack", label: "Snack" },
];

export function MealLog() {
  const { profileId, allProfiles } = useProfile();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [tipo, setTipo] = useState<MealTipo>("batido");
  const [nota, setNota] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const refresh = () => getMeals().then(setMeals);

  const profileName = (id: ProfileId) =>
    PROFILE_DISPLAY_NAMES[allProfiles.find((p) => p.id === id)?.name ?? "jose"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    await addMeal(profileId, tipo, nota.trim(), visibility);
    setNota("");
    refresh();
  };

  if (!mounted) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Alimentación</h3>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          {TIPOS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                tipo === t.id
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota (opcional)"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <div className="flex items-center justify-between gap-2">
          <VisibilityToggle value={visibility} onChange={setVisibility} />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            Registrar
          </button>
        </div>
      </form>

      {meals.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {meals.slice(0, 8).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"
            >
              <span className="text-zinc-700 dark:text-zinc-200">
                {m.visibility === "private" ? "🔒 " : ""}
                {TIPOS.find((t) => t.id === m.tipo)?.label} · {profileName(m.ownerId)}
                {m.nota ? ` — ${m.nota}` : ""}
              </span>
              {m.ownerId === profileId && (
                <button
                  onClick={() => deleteMeal(m.id).then(refresh)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
