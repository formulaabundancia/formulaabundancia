"use client";

import { useEffect, useState } from "react";
import {
  addListItem,
  deleteListItem,
  getCoupleAgreement,
  getListItems,
  setCoupleAgreementPactos,
  signCoupleAgreement,
} from "@/lib/storage";
import { CoupleAgreement, ListItem, PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { HandshakeIcon } from "@/components/icons";

const BLOCK_KEY = "no-negociables";
const AREAS = [
  { id: "Relación", icon: "❤️" },
  { id: "Salud", icon: "🌿" },
  { id: "Finanzas", icon: "💰" },
  { id: "Valores", icon: "🧭" },
  { id: "Familia", icon: "👨‍👩‍👧" },
  { id: "Tiempo", icon: "⏳" },
];

function AreaBlock({ area, icon, items, onChange }: { area: string; icon: string; items: ListItem[]; onChange: () => void }) {
  const { profileId } = useProfile();
  const [texto, setTexto] = useState("");
  const [showInput, setShowInput] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !profileId) return;
    await addListItem(BLOCK_KEY, texto.trim(), null, profileId, "shared", area);
    setTexto("");
    onChange();
  };

  return (
    <div>
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <span>{icon}</span>
        {area}
      </h4>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200">{item.titulo}</span>
            <button onClick={() => deleteListItem(item.id).then(onChange)} className="shrink-0 text-zinc-400 hover:text-red-500">
              ✕
            </button>
          </div>
        ))}
        {showInput ? (
          <form onSubmit={add} className="flex gap-1.5">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoFocus
              placeholder={`No negociable de ${area.toLowerCase()}`}
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
            />
            <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
              +
            </button>
          </form>
        ) : (
          <button onClick={() => setShowInput(true)} className="self-start text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            + Añadir
          </button>
        )}
      </div>
    </div>
  );
}

function AgreementSection() {
  const { profile } = useProfile();
  const [agreement, setAgreement] = useState<CoupleAgreement | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const refresh = () => getCoupleAgreement().then(setAgreement);

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = () => {
    setDraft((agreement?.pactos ?? []).join("\n"));
    setEditing(true);
  };

  const save = async () => {
    const pactos = draft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    await setCoupleAgreementPactos(pactos);
    setEditing(false);
    refresh();
  };

  const sign = async () => {
    if (profile?.name !== "jose" && profile?.name !== "viviana") return;
    await signCoupleAgreement(profile.name);
    refresh();
  };

  if (!agreement) return null;

  const canSign = profile?.name === "jose" || profile?.name === "viviana";
  const miFirma = profile?.name === "jose" ? agreement.firmaJose : profile?.name === "viviana" ? agreement.firmaViviana : undefined;

  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-rose-200 p-4 dark:border-rose-900/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Acuerdo de pareja</h4>
        <button onClick={() => (editing ? save() : startEdit())} className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          {editing ? "Guardar" : "Editar"}
        </button>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Los no negociables compartidos que ambos firmáis.</p>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="Un no negociable por línea"
          className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
        />
      ) : agreement.pactos.length > 0 ? (
        <ol className="mt-3 flex flex-col gap-1.5">
          {agreement.pactos.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold text-rose-500">{i + 1}.</span>
              {p}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">Aún no habéis escrito vuestro acuerdo. Pulsa &ldquo;Editar&rdquo;.</p>
      )}

      {!editing && agreement.pactos.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="text-xs">
            <span className="text-zinc-400">Jose:</span>{" "}
            <span className={agreement.firmaJose ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
              {agreement.firmaJose ? `firmado ${agreement.firmaJose}` : "sin firmar"}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-400">Viviana:</span>{" "}
            <span className={agreement.firmaViviana ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
              {agreement.firmaViviana ? `firmado ${agreement.firmaViviana}` : "sin firmar"}
            </span>
          </div>
          {canSign && !miFirma && (
            <button onClick={sign} className="rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-600">
              Firmar como {PROFILE_DISPLAY_NAMES[profile!.name]}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoNegociablesBoard() {
  const [items, setItems] = useState<ListItem[] | null>(null);

  const refresh = () => getListItems(BLOCK_KEY).then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  if (!items) return null;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <HandshakeIcon className="h-5 w-5 text-rose-500" />
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">No negociables</h3>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Vuestras líneas rojas por área. Revisadlas cada 3 meses.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {AREAS.map((a) => (
          <AreaBlock key={a.id} area={a.id} icon={a.icon} items={items.filter((i) => i.categoria === a.id)} onChange={refresh} />
        ))}
      </div>

      <AgreementSection />
    </div>
  );
}
