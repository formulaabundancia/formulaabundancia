"use client";

import { useEffect, useState } from "react";
import { addReward, deleteReward, getRewards, toggleRewardConseguido } from "@/lib/storage";
import { Reward } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { GiftIcon } from "@/components/icons";

function RewardCard({ reward, onChange }: { reward: Reward; onChange: () => void }) {
  const { profileId } = useProfile();
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-sm ${
        reward.conseguido ? "bg-amber-50 dark:bg-amber-950/30" : "bg-white dark:bg-zinc-900"
      }`}
    >
      {reward.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={reward.imagenUrl} alt={reward.nombre} className="h-36 w-full object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{reward.nombre}</p>
            {reward.descripcion && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{reward.descripcion}</p>
            )}
            {reward.condicion && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                🎯 {reward.condicion}
              </p>
            )}
            {reward.conseguido && reward.fechaConseguido && (
              <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                🎉 ¡Conseguido el {reward.fechaConseguido}!
              </p>
            )}
          </div>
          {reward.ownerId === profileId && (
            <button
              onClick={() => deleteReward(reward.id).then(onChange)}
              className="shrink-0 text-xs text-zinc-400 hover:text-red-500"
            >
              Eliminar
            </button>
          )}
        </div>
        <button
          onClick={() => toggleRewardConseguido(reward.id, reward.conseguido).then(onChange)}
          className={`mt-3 w-full rounded-xl py-2 text-sm font-medium transition ${
            reward.conseguido
              ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {reward.conseguido ? "Volver a pendiente" : "¡Nos lo hemos ganado!"}
        </button>
      </div>
    </div>
  );
}

export function RewardsBoard() {
  const { profileId } = useProfile();
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [condicion, setCondicion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  const refresh = () => getRewards().then(setRewards);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profileId) return;
    await addReward(nombre.trim(), descripcion.trim(), condicion.trim(), profileId, "shared", imagenUrl.trim() || undefined);
    setNombre("");
    setDescripcion("");
    setCondicion("");
    setImagenUrl("");
    setShowForm(false);
    refresh();
  };

  if (!rewards) return null;

  const pendientes = rewards.filter((r) => !r.conseguido);
  const conseguidos = rewards.filter((r) => r.conseguido);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <GiftIcon className="h-5 w-5 text-amber-500" />
        <h3 className="font-medium text-zinc-800 dark:text-zinc-100">Premios y escapadas</h3>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Celebraciones que os regaláis cuando os lo ganáis juntos.
      </p>

      <button
        onClick={() => setShowForm((s) => !s)}
        className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir premio"}
      </button>

      {showForm && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: escapada rural de fin de semana"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={condicion}
            onChange={(e) => setCondicion(e.target.value)}
            placeholder="¿Cuándo? Ej: al completar 30 días de rutina"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalle (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            placeholder="Enlace a una foto (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <button
            type="submit"
            className="mt-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {pendientes.map((r) => (
          <RewardCard key={r.id} reward={r} onChange={refresh} />
        ))}
      </div>

      {conseguidos.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Celebrados</h4>
          <div className="flex flex-col gap-3">
            {conseguidos.map((r) => (
              <RewardCard key={r.id} reward={r} onChange={refresh} />
            ))}
          </div>
        </div>
      )}

      {rewards.length === 0 && (
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500">
          Aún no hay premios — añade el primero (una cena, una escapada, lo que os motive).
        </p>
      )}
    </div>
  );
}
