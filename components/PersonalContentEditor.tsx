"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile-context";
import {
  addDeseo,
  deleteDeseo,
  getPersonalContent,
  setAgradecimientos,
  setDecretos,
} from "@/lib/storage";
import { Deseo, PersonalContent } from "@/lib/types";

function EditableList({
  title,
  items,
  onSave,
}: {
  title: string;
  items: string[];
  onSave: (items: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items.join("\n"));

  return (
    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{title}</h4>
        <button
          onClick={() => {
            if (editing) onSave(draft.split("\n").map((l) => l.trim()).filter(Boolean));
            else setDraft(items.join("\n"));
            setEditing((e) => !e);
          }}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          {editing ? "Guardar" : "Editar"}
        </button>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          placeholder="Una frase por línea..."
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      ) : items.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400">Aún no has añadido nada aquí.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
          {items.map((item, i) => (
            <li key={i}>· {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MusicLinks({ links }: { links: string[] }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
      🎵 Música: {links.join(" · ")}
    </div>
  );
}

export function PersonalContentEditor({ mode }: { mode: "decretos" | "visualizacion" }) {
  const { profileId } = useProfile();
  const [content, setContent] = useState<PersonalContent | null>(null);
  const [nuevoDeseo, setNuevoDeseo] = useState("");

  useEffect(() => {
    if (profileId) getPersonalContent(profileId).then(setContent);
  }, [profileId]);

  const refresh = () => {
    if (profileId) getPersonalContent(profileId).then(setContent);
  };

  if (!profileId || !content) return null;

  if (mode === "decretos") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Decretos y agradecimientos</h3>
        <div className="mt-4 flex flex-col gap-3">
          <EditableList
            title="Decretos"
            items={content.decretos}
            onSave={(items) => setDecretos(profileId, items).then(refresh)}
          />
          <EditableList
            title="Agradecimientos"
            items={content.agradecimientos}
            onSave={(items) => setAgradecimientos(profileId, items).then(refresh)}
          />
        </div>
        <MusicLinks links={content.musicaDecretos} />
      </div>
    );
  }

  const submitDeseo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDeseo.trim()) return;
    await addDeseo(profileId, nuevoDeseo.trim());
    setNuevoDeseo("");
    refresh();
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Visualización</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Mano en el corazón, di la frase e imagina el deseo — 30 segundos por cada uno. Cuando sientas que ya lo
        tienes, pasa al siguiente. Mejor por la noche.
      </p>

      <form onSubmit={submitDeseo} className="mt-4 flex gap-2">
        <input
          value={nuevoDeseo}
          onChange={(e) => setNuevoDeseo(e.target.value)}
          placeholder="Yo disfruto de..."
          className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          +
        </button>
      </form>

      {content.deseos.length > 0 && (
        <ol className="mt-3 flex flex-col gap-1.5">
          {content.deseos.map((d: Deseo, i: number) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"
            >
              <span className="text-zinc-700 dark:text-zinc-200">
                {i + 1}. {d.texto}
              </span>
              <button
                onClick={() => deleteDeseo(profileId, d.id).then(refresh)}
                className="text-zinc-400 hover:text-red-500"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}
      <MusicLinks links={content.musicaVisualizacion} />
    </div>
  );
}
