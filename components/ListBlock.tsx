"use client";

import { useEffect, useState } from "react";
import { addListItem, deleteListItem, getListItems, toggleListItem } from "@/lib/storage";
import { ListItem, PROFILE_AVATAR_COLOR, PROFILE_DISPLAY_NAMES, ProfileId, ProfileName, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { ProgressRing } from "@/components/ProgressRing";

const DEFAULT_TAREAS = ["Sacar la basura", "Lavar los platos", "Hacer la compra"];

function assignedProfile(allProfiles: { id: string; name: ProfileName }[], id: ProfileId | null) {
  if (!id) return null;
  return allProfiles.find((p) => p.id === id) ?? null;
}

function Avatar({ name }: { name: ProfileName }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${PROFILE_AVATAR_COLOR[name]}`}
      title={PROFILE_DISPLAY_NAMES[name]}
    >
      {PROFILE_DISPLAY_NAMES[name][0]}
    </span>
  );
}

export interface ListBlockProps {
  blockKey: string;
  title: string;
  allowAssign?: boolean;
  itemLabel?: string;
}

export function ListBlock({ blockKey, title, allowAssign, itemLabel = "Nuevo item" }: ListBlockProps) {
  const { profileId, allProfiles } = useProfile();
  const [items, setItems] = useState<ListItem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [asignadoA, setAsignadoA] = useState<ProfileId | "">("");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const refresh = async () => {
    let data = await getListItems(blockKey);
    if (data.length === 0 && blockKey === "tareas-casa" && profileId) {
      for (const titulo of DEFAULT_TAREAS) {
        await addListItem(blockKey, titulo, null, profileId, "shared");
      }
      data = await getListItems(blockKey);
    }
    setItems(data);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !profileId) return;
    await addListItem(blockKey, titulo.trim(), asignadoA || null, profileId, visibility);
    setTitulo("");
    setAsignadoA("");
    refresh();
  };

  if (!mounted) return null;

  const pendientes = items.filter((i) => !i.hecho);
  const hechos = items.filter((i) => i.hecho);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{title}</h3>
        {items.length > 0 && (
          <ProgressRing value={hechos.length} total={items.length} size={40} strokeWidth={4.5} />
        )}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={itemLabel}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
        />
        <div className="flex flex-wrap items-center gap-2">
          {allowAssign && (
            <select
              value={asignadoA}
              onChange={(e) => setAsignadoA(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Cualquiera</option>
              {allProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {PROFILE_DISPLAY_NAMES[p.name]}
                </option>
              ))}
            </select>
          )}
          <VisibilityToggle value={visibility} onChange={setVisibility} />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Añadir
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {pendientes.map((item) => {
          const assignee = assignedProfile(allProfiles, item.asignadoA);
          return (
            <button
              key={item.id}
              onClick={() => toggleListItem(item.id, item.hecho).then(refresh)}
              className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                <span className="text-zinc-800 dark:text-zinc-100">
                  {item.visibility === "private" ? "🔒 " : ""}
                  {item.titulo}
                </span>
              </span>
              {allowAssign && (assignee ? <Avatar name={assignee.name} /> : <span className="text-xs text-zinc-400">Cualquiera</span>)}
            </button>
          );
        })}
      </div>

      {hechos.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Hechos</h4>
          <div className="flex flex-col gap-2">
            {hechos.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-zinc-50/60 px-4 py-3 dark:bg-zinc-900/50"
              >
                <button onClick={() => toggleListItem(item.id, item.hecho).then(refresh)} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm text-white">
                    ✓
                  </span>
                  <span className="text-zinc-400 line-through">{item.titulo}</span>
                </button>
                <button
                  onClick={() => deleteListItem(item.id).then(refresh)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
