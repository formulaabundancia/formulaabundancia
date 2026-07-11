"use client";

import { useEffect, useState } from "react";
import { addAmountItem, deleteAmountItem, getAmountItems } from "@/lib/storage";
import { AmountItem, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

function formatMoney(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function MiniLedger({
  blockKey,
  title,
  itemLabel,
  accent,
}: {
  blockKey: string;
  title: string;
  itemLabel: string;
  accent: string;
}) {
  const { profileId } = useProfile();
  const [items, setItems] = useState<AmountItem[]>([]);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const refresh = () => getAmountItems(blockKey).then(setItems);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(monto);
    if (!nombre.trim() || Number.isNaN(value) || value <= 0 || !profileId) return;
    await addAmountItem(blockKey, nombre.trim(), value, profileId, visibility);
    setNombre("");
    setMonto("");
    refresh();
  };

  if (!mounted) return null;

  const total = items.reduce((acc, i) => acc + i.monto, 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{title}</h3>
        <span className={`text-sm font-semibold ${accent}`}>{formatMoney(total)}</span>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={itemLabel}
          className="min-w-[140px] flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <input
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          type="number"
          step="0.01"
          placeholder="€"
          className="w-24 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <VisibilityToggle value={visibility} onChange={setVisibility} />
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          +
        </button>
      </form>

      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-800/60"
            >
              <span className="text-zinc-700 dark:text-zinc-200">
                {item.visibility === "private" ? "🔒 " : ""}
                {item.nombre}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-zinc-600 dark:text-zinc-300">{formatMoney(item.monto)}</span>
                <button
                  onClick={() => deleteAmountItem(item.id).then(refresh)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NetWorthTracker() {
  return (
    <div className="flex flex-col gap-5">
      <MiniLedger
        blockKey="dinero-cuerpo-ingresos"
        title="Fuentes de ingreso"
        itemLabel="Ej: nómina, freelance..."
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <MiniLedger
        blockKey="dinero-cuerpo-patrimonio"
        title="Patrimonio e inversiones"
        itemLabel="Ej: fondo, acciones..."
        accent="text-amber-600 dark:text-amber-400"
      />
      <MiniLedger
        blockKey="dinero-cuerpo-gastos-fijos"
        title="Gastos fijos"
        itemLabel="Ej: alquiler, seguros..."
        accent="text-red-500 dark:text-red-400"
      />
    </div>
  );
}
