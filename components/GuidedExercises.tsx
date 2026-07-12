"use client";

import { useEffect, useRef, useState } from "react";
import { getAllExercises, upsertExercise } from "@/lib/storage";
import { useProfile } from "@/lib/profile-context";

function Card({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-zinc-900">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <div>
          <h3 className="font-medium text-zinc-800 dark:text-zinc-100">{titulo}</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{subtitulo}</p>
        </div>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">{children}</div>}
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={async () => {
        setSaving(true);
        await onSave();
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      disabled={saving}
      className="mt-3 w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100";

// ---------- 1. Los 5 porqués ----------
function FiveWhys() {
  const { profileId } = useProfile();
  const [pregunta, setPregunta] = useState("¿Por qué queremos vivir de ingresos online?");
  const [respuestas, setRespuestas] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    getAllExercises<{ pregunta: string; respuestas: string[] }>("cinco_porques").then((rows) => {
      const mine = rows.find((r) => r.ownerId === profileId)?.data;
      if (mine) {
        if (mine.pregunta) setPregunta(mine.pregunta);
        if (mine.respuestas?.length) setRespuestas([0, 1, 2, 3, 4].map((i) => mine.respuestas[i] ?? ""));
      }
    });
  }, [profileId]);

  return (
    <div className="flex flex-col gap-2">
      <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} className={inputCls} placeholder="Pregunta inicial" />
      {respuestas.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-center text-xs font-bold text-indigo-500">{i + 1}</span>
          <input
            value={r}
            onChange={(e) => setRespuestas((rs) => rs.map((x, j) => (j === i ? e.target.value : x)))}
            className={inputCls}
            placeholder={i === 4 ? "…y este suele ser el porqué profundo" : "¿Por qué eso?"}
          />
        </div>
      ))}
      {profileId && <SaveButton onSave={() => upsertExercise("cinco_porques", { pregunta, respuestas }, profileId)} />}
    </div>
  );
}

// ---------- 2. Perfil de motivaciones ----------
const CATEGORIAS = ["Autonomía", "Competencia", "Relación"];
function MotivationProfile() {
  const { profileId } = useProfile();
  const [items, setItems] = useState<{ texto: string; categoria: string }[]>([]);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);

  useEffect(() => {
    getAllExercises<{ actividades: { texto: string; categoria: string }[] }>("motivaciones").then((rows) => {
      const mine = rows.find((r) => r.ownerId === profileId)?.data.actividades;
      if (mine) setItems(mine);
    });
  }, [profileId]);

  const add = async () => {
    if (!texto.trim() || !profileId) return;
    const next = [...items, { texto: texto.trim(), categoria }];
    setItems(next);
    setTexto("");
    await upsertExercise("motivaciones", { actividades: next }, profileId);
  };

  const remove = async (idx: number) => {
    if (!profileId) return;
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    await upsertExercise("motivaciones", { actividades: next }, profileId);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Lista actividades que te hacen sentir vivo y clasifícalas. Ideal: llegar a 10.
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200">{it.texto}</span>
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
              {it.categoria}
            </span>
            <button onClick={() => remove(i)} className="shrink-0 text-zinc-400 hover:text-red-500">
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} className={inputCls} placeholder="Actividad que te energiza" />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="rounded-xl border border-zinc-200 px-2 py-2 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button onClick={add} className="rounded-xl bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
          +
        </button>
      </div>
    </div>
  );
}

// ---------- 3. Scoring de negocio ----------
interface Opcion {
  nombre: string;
  viabilidad: number;
  tiempo: number;
  motivacion: number;
}
function BusinessScoring() {
  const { profileId } = useProfile();
  const [opciones, setOpciones] = useState<Opcion[]>([
    { nombre: "Trading", viabilidad: 5, tiempo: 5, motivacion: 5 },
    { nombre: "Consultoría / Mentoría", viabilidad: 5, tiempo: 5, motivacion: 5 },
    { nombre: "Educación online", viabilidad: 5, tiempo: 5, motivacion: 5 },
  ]);
  const [nuevo, setNuevo] = useState("");

  useEffect(() => {
    getAllExercises<{ opciones: Opcion[] }>("negocio").then((rows) => {
      const mine = rows.find((r) => r.ownerId === profileId)?.data.opciones;
      if (mine?.length) setOpciones(mine);
    });
  }, [profileId]);

  const setVal = (i: number, key: keyof Opcion, val: number) =>
    setOpciones((os) => os.map((o, j) => (j === i ? { ...o, [key]: val } : o)));

  const total = (o: Opcion) => o.viabilidad + o.tiempo + o.motivacion;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Puntúa cada opción (0-10) en viabilidad, tiempo y motivación.</p>
      {opciones.map((o, i) => (
        <div key={i} className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{o.nombre}</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              {total(o)}/30
            </span>
          </div>
          {(["viabilidad", "tiempo", "motivacion"] as const).map((k) => (
            <div key={k} className="mt-1.5 flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] capitalize text-zinc-500 dark:text-zinc-400">{k}</span>
              <input
                type="range"
                min={0}
                max={10}
                value={o[k]}
                onChange={(e) => setVal(i, k, Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-indigo-500"
              />
              <span className="w-5 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-200">{o[k]}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="flex gap-2">
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} className={inputCls} placeholder="Añadir opción de negocio" />
        <button
          onClick={() => {
            if (!nuevo.trim()) return;
            setOpciones((os) => [...os, { nombre: nuevo.trim(), viabilidad: 5, tiempo: 5, motivacion: 5 }]);
            setNuevo("");
          }}
          className="rounded-xl bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          +
        </button>
      </div>
      {profileId && <SaveButton onSave={() => upsertExercise("negocio", { opciones }, profileId)} />}
    </div>
  );
}

// ---------- 4. Conversación consciente (timer 15+15) ----------
function ConsciousConversation() {
  const [phase, setPhase] = useState<"a" | "b">("a");
  const [seconds, setSeconds] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  const switchPhase = () => {
    setPhase((p) => (p === "a" ? "b" : "a"));
    setSeconds(15 * 60);
    setRunning(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        30 min: cada uno habla 15 min sin interrupción. Tema: “¿Qué necesito de ti para que ambos tengamos éxito?”
      </p>
      <div className="rounded-2xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/60">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
          Habla la persona {phase === "a" ? "A" : "B"}
        </span>
        <p className="mt-2 font-mono text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
          {mm}:{ss}
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => setRunning((r) => !r)} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            {running ? "Pausar" : "Empezar"}
          </button>
          <button onClick={switchPhase} className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Cambiar turno
          </button>
        </div>
      </div>
      <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Quien habla:</p>
        <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
          1-3 min: aprecia algo · 4-8: necesidad emocional · 9-12: necesidad práctica · 13-15: una aspiración conjunta
        </p>
      </div>
      <div className="rounded-xl bg-rose-50 px-3 py-2 dark:bg-rose-950/20">
        <p className="text-[11px] text-rose-700 dark:text-rose-300">
          Quien escucha: sin interrumpir, sin justificarse, sin ir a la defensiva. Solo escuchar para entender.
        </p>
      </div>
    </div>
  );
}

export function GuidedExercises() {
  return (
    <div className="flex flex-col gap-3">
      <Card titulo="Los 5 porqués" subtitulo="Semana 1 — llega al porqué profundo">
        <FiveWhys />
      </Card>
      <Card titulo="Perfil de motivaciones" subtitulo="Semana 3 — qué te da energía">
        <MotivationProfile />
      </Card>
      <Card titulo="Scoring de negocio" subtitulo="Semana 4 — puntúa las opciones">
        <BusinessScoring />
      </Card>
      <Card titulo="Conversación consciente" subtitulo="Semana 7 — 15 + 15 minutos">
        <ConsciousConversation />
      </Card>
    </div>
  );
}
