"use client";

import { useEffect, useState } from "react";
import { addListItem, deleteListItem, getListItems, toggleListItem, todayStr, updateListItem } from "@/lib/storage";
import { ListItem, PROFILE_AVATAR_COLOR, PROFILE_DISPLAY_NAMES, ProfileId, ProfileName } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { ProgressRing } from "@/components/ProgressRing";
import { PencilIcon } from "@/components/icons";

const DEFAULT_TAREAS: { titulo: string; categoria: string }[] = [
  { titulo: "Sacar la basura", categoria: "Cocina" },
  { titulo: "Lavar los platos", categoria: "Cocina" },
  { titulo: "Hacer la compra", categoria: "General" },
];

const CATEGORY_OPTIONS = ["General", "Cocina", "Baño", "Salón", "Dormitorio", "Compra", "Exterior"];
const CATEGORY_ICON: Record<string, string> = {
  General: "📋",
  Cocina: "🍳",
  Baño: "🛁",
  Salón: "🛋️",
  Dormitorio: "🛏️",
  Compra: "🛒",
  Exterior: "🌳",
};

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

interface EditDraft {
  titulo: string;
  categoria: string;
  asignadoA: ProfileId | "";
}

function EditTaskRow({
  draft,
  onChange,
  onSave,
  onCancel,
  allowAssign,
  allowCategory,
  allProfiles,
}: {
  draft: EditDraft;
  onChange: (draft: EditDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  allowAssign?: boolean;
  allowCategory?: boolean;
  allProfiles: { id: string; name: ProfileName }[];
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
      <input
        value={draft.titulo}
        onChange={(e) => onChange({ ...draft, titulo: e.target.value })}
        className="rounded-lg border border-transparent bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        {allowCategory && (
          <select
            value={draft.categoria}
            onChange={(e) => onChange({ ...draft, categoria: e.target.value })}
            className="rounded-lg border border-transparent bg-white px-2 py-1.5 text-xs outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_ICON[c]} {c}
              </option>
            ))}
          </select>
        )}
        {allowAssign && (
          <select
            value={draft.asignadoA}
            onChange={(e) => onChange({ ...draft, asignadoA: e.target.value })}
            className="flex-1 rounded-lg border border-transparent bg-white px-2 py-1.5 text-xs outline-none focus:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
          >
            <option value="">Cualquiera</option>
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {PROFILE_DISPLAY_NAMES[p.name]}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-0.5">
        <button onClick={onCancel} className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          Cancelar
        </button>
        <button onClick={onSave} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          Guardar
        </button>
      </div>
    </div>
  );
}

function TaskRow({
  item,
  done,
  allowAssign,
  allProfiles,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ListItem;
  done: boolean;
  allowAssign?: boolean;
  allProfiles: { id: string; name: ProfileName }[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const assignee = assignedProfile(allProfiles, item.asignadoA);
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-2xl px-4 py-3 transition ${
        done ? "bg-zinc-50/60 dark:bg-zinc-900/50" : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
      }`}
    >
      <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
            done ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {done ? "✓" : ""}
        </span>
        <span className={`truncate ${done ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-100"}`}>
          {item.visibility === "private" ? "🔒 " : ""}
          {item.titulo}
        </span>
      </button>
      <span className="flex shrink-0 items-center gap-2.5">
        {allowAssign &&
          (assignee ? (
            <Avatar name={assignee.name} />
          ) : (
            !done && <span className="text-xs text-zinc-400">Cualquiera</span>
          ))}
        <button onClick={onEdit} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" aria-label="Editar tarea" title="Editar">
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="text-zinc-400 hover:text-red-500" aria-label="Eliminar tarea" title="Eliminar">
          ✕
        </button>
      </span>
    </div>
  );
}

export interface ListBlockProps {
  blockKey: string;
  title: string;
  allowAssign?: boolean;
  allowCategory?: boolean;
  dailyReset?: boolean;
  itemLabel?: string;
}

export function ListBlock({
  blockKey,
  title,
  allowAssign,
  allowCategory,
  dailyReset,
  itemLabel = "Nuevo item",
}: ListBlockProps) {
  const { profileId, allProfiles } = useProfile();
  const [items, setItems] = useState<ListItem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [asignadoA, setAsignadoA] = useState<ProfileId | "">("");
  const [categoria, setCategoria] = useState(CATEGORY_OPTIONS[0]);
  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ titulo: "", categoria: CATEGORY_OPTIONS[0], asignadoA: "" });

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const refresh = async () => {
    let data = await getListItems(blockKey);
    if (data.length === 0 && blockKey === "tareas-casa" && profileId) {
      for (const t of DEFAULT_TAREAS) {
        await addListItem(blockKey, t.titulo, null, profileId, "shared", t.categoria);
      }
      data = await getListItems(blockKey);
    }
    setItems(data);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !profileId) return;
    await addListItem(blockKey, titulo.trim(), asignadoA || null, profileId, "shared", allowCategory ? categoria : null);
    setTitulo("");
    setAsignadoA("");
    refresh();
  };

  const startEdit = (item: ListItem) => {
    setEditingId(item.id);
    setEditDraft({
      titulo: item.titulo,
      categoria: item.categoria || CATEGORY_OPTIONS[0],
      asignadoA: item.asignadoA || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft.titulo.trim()) return;
    await updateListItem(editingId, {
      titulo: editDraft.titulo.trim(),
      categoria: allowCategory ? editDraft.categoria : null,
      asignadoA: editDraft.asignadoA || null,
    });
    setEditingId(null);
    refresh();
  };

  if (!mounted) return null;

  const isDone = (item: ListItem) => (dailyReset ? item.hechoDate === todayStr() : item.hecho);
  const pendientes = items.filter((i) => !isDone(i));
  const hechos = items.filter((i) => isDone(i));

  const grupos = allowCategory
    ? pendientes.reduce<Record<string, ListItem[]>>((acc, item) => {
        const key = item.categoria || "General";
        (acc[key] ??= []).push(item);
        return acc;
      }, {})
    : { "": pendientes };

  const renderRow = (item: ListItem) => {
    if (editingId === item.id) {
      return (
        <EditTaskRow
          key={item.id}
          draft={editDraft}
          onChange={setEditDraft}
          onSave={saveEdit}
          onCancel={() => setEditingId(null)}
          allowAssign={allowAssign}
          allowCategory={allowCategory}
          allProfiles={allProfiles}
        />
      );
    }
    return (
      <TaskRow
        key={item.id}
        item={item}
        done={isDone(item)}
        allowAssign={allowAssign}
        allProfiles={allProfiles}
        onToggle={() => toggleListItem(item.id, isDone(item), dailyReset).then(refresh)}
        onEdit={() => startEdit(item)}
        onDelete={() => deleteListItem(item.id).then(refresh)}
      />
    );
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{title}</h3>
        {items.length > 0 && <ProgressRing value={hechos.length} total={items.length} size={40} strokeWidth={4.5} />}
      </div>
      {dailyReset && (
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Se marcan por día — mañana vuelven a empezar</p>
      )}

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={itemLabel}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
        />
        <div className="flex flex-wrap items-center gap-2">
          {allowCategory && (
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_ICON[c]} {c}
                </option>
              ))}
            </select>
          )}
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
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Añadir
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-4">
        {Object.entries(grupos).map(([cat, catItems]) => {
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              {allowCategory && cat && (
                <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <span>{CATEGORY_ICON[cat] ?? "📋"}</span>
                  {cat}
                </h4>
              )}
              <div className="flex flex-col gap-2">{catItems.map(renderRow)}</div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay tareas — añade la primera arriba.</p>
        )}
      </div>

      {hechos.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {dailyReset ? "Hechos hoy" : "Hechos"}
          </h4>
          <div className="flex flex-col gap-2">{hechos.map(renderRow)}</div>
        </div>
      )}
    </div>
  );
}
