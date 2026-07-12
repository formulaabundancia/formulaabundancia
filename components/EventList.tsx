"use client";

import { useEffect, useRef, useState } from "react";
import { addEvento, deleteEvento, getEventos, todayStr } from "@/lib/storage";
import { DEFAULT_EVENTS } from "@/lib/events-seed";
import { Evento } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

function formatRange(evento: Evento): string {
  if (!evento.fechaFin || evento.fechaFin === evento.fechaInicio) return formatDate(evento.fechaInicio);
  const [y1, m1, d1] = evento.fechaInicio.split("-").map(Number);
  const [y2, m2, d2] = evento.fechaFin.split("-").map(Number);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTH_SHORT[m1 - 1]} ${y1}`;
  return `${formatDate(evento.fechaInicio)} – ${formatDate(evento.fechaFin)}`;
}

function EventCard({ evento, onChange }: { evento: Evento; onChange: () => void }) {
  const { profileId } = useProfile();
  const isPast = (evento.fechaFin ?? evento.fechaInicio) < todayStr();

  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 ${isPast ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{evento.titulo}</p>
          <p className="mt-0.5 text-xs font-medium text-indigo-500 dark:text-indigo-400">{formatRange(evento)}</p>
          {evento.lugar && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{evento.lugar}</p>}
        </div>
        {evento.ownerId === profileId && (
          <button
            onClick={() => deleteEvento(evento.id).then(onChange)}
            className="shrink-0 text-xs text-zinc-400 hover:text-red-500"
          >
            Eliminar
          </button>
        )}
      </div>
      {evento.url && (
        <a
          href={evento.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-indigo-500 underline dark:text-indigo-400"
        >
          Ver más
        </a>
      )}
    </div>
  );
}

export function EventList() {
  const { profileId } = useProfile();
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lugar, setLugar] = useState("");
  const [url, setUrl] = useState("");

  const seeded = useRef(false);

  const refresh = () => getEventos().then(setEventos);

  useEffect(() => {
    refresh();
  }, []);

  // Siembra la primera vez, igual que RecipeBook/VideoLibrary.
  useEffect(() => {
    if (seeded.current) return;
    if (eventos !== null && eventos.length === 0 && profileId) {
      seeded.current = true;
      (async () => {
        try {
          for (const e of DEFAULT_EVENTS) {
            await addEvento(e.titulo, e.fechaInicio, profileId, "shared", e.fechaFin, e.url, e.lugar);
          }
          refresh();
        } catch (err) {
          console.error("No se pudieron sembrar los eventos — revisa que la tabla 'events' esté al día", err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos, profileId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInicio || !profileId) return;
    // Siempre compartido: Viviana ve todo lo que se añada.
    await addEvento(
      titulo.trim(),
      fechaInicio,
      profileId,
      "shared",
      fechaFin || undefined,
      url.trim() || undefined,
      lugar.trim() || undefined
    );
    setTitulo("");
    setFechaInicio("");
    setFechaFin("");
    setLugar("");
    setUrl("");
    setShowForm(false);
    refresh();
  };

  if (!eventos) return null;

  const today = todayStr();
  const proximos = eventos.filter((e) => (e.fechaFin ?? e.fechaInicio) >= today);
  const pasados = eventos.filter((e) => (e.fechaFin ?? e.fechaInicio) < today);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShowForm((s) => !s)}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir evento"}
      </button>

      {showForm && (
        <form onSubmit={submit} className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del evento"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              placeholder="Fin (opcional)"
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
            />
          </div>
          <input
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            placeholder="Lugar (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enlace (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <p className="text-xs text-zinc-400">El evento lo verá también Viviana — aquí no hay opción de privado.</p>
          <button
            type="submit"
            className="mt-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Guardar
          </button>
        </form>
      )}

      {proximos.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Próximos</h3>
          <div className="flex flex-col gap-2">
            {proximos.map((e) => (
              <EventCard key={e.id} evento={e} onChange={refresh} />
            ))}
          </div>
        </div>
      )}

      {pasados.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Pasados</h3>
          <div className="flex flex-col gap-2">
            {pasados.map((e) => (
              <EventCard key={e.id} evento={e} onChange={refresh} />
            ))}
          </div>
        </div>
      )}

      {eventos.length === 0 && <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay eventos.</p>}
    </div>
  );
}
