"use client";

import { useEffect, useState } from "react";
import { getWheelEntries, upsertWheelScore } from "@/lib/storage";
import { WheelEntry, PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { TrendBadge } from "@/components/TrendBadge";
import { currentMonthStr, monthLabel, shiftMonth, WHEEL_AREAS } from "@/lib/wheel";

const CENTER = 130;
const MAX_R = 95;

function polar(r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

function wedgePath(r: number, a0: number, a1: number): string {
  if (r <= 0) return "";
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return `M ${CENTER} ${CENTER} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
}

function WheelSvg({ getScore }: { getScore: (areaId: string) => number | undefined }) {
  return (
    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[280px]">
      {/* anillos de referencia */}
      {[1, 2, 3, 4, 5].map((i) => (
        <circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={(MAX_R / 5) * i}
          fill="none"
          className="stroke-zinc-200 dark:stroke-zinc-700"
          strokeWidth={1}
        />
      ))}
      {WHEEL_AREAS.map((area, i) => {
        const a0 = -90 + i * 45;
        const a1 = a0 + 45;
        const score = getScore(area.id) ?? 0;
        const r = (score / 10) * MAX_R;
        const [lx, ly] = polar(MAX_R + 20, a0 + 22.5);
        return (
          <g key={area.id}>
            {r > 0 && <path d={wedgePath(r, a0, a1)} fill={area.color} fillOpacity={0.8} />}
            {/* radio divisorio */}
            <line
              x1={CENTER}
              y1={CENTER}
              x2={polar(MAX_R, a0)[0]}
              y2={polar(MAX_R, a0)[1]}
              className="stroke-zinc-200 dark:stroke-zinc-700"
              strokeWidth={1}
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-500 dark:fill-zinc-400"
              style={{ fontSize: 9, fontWeight: 600 }}
            >
              {area.label.length > 10 ? area.label.split(" ")[0] : area.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WheelOfLife() {
  const { profileId, profile, adultProfiles } = useProfile();
  const [entries, setEntries] = useState<WheelEntry[] | null>(null);
  const [mes, setMes] = useState(currentMonthStr());
  const [view, setView] = useState<string | null>(null); // profileId, "media", o null = por defecto
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeView = view ?? profileId ?? "media";

  const refresh = () => getWheelEntries().then(setEntries);

  useEffect(() => {
    refresh();
  }, []);

  // Al cambiar de mes o cargar datos, precarga tu borrador con tus puntuaciones.
  useEffect(() => {
    if (!entries || !profileId) return;
    const mine: Record<string, number> = {};
    for (const area of WHEEL_AREAS) {
      const e = entries.find((x) => x.ownerId === profileId && x.mes === mes && x.area === area.id);
      mine[area.id] = e?.score ?? 5;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(mine);
  }, [entries, profileId, mes]);

  const scoreFor = (owner: string, m: string, area: string) =>
    entries?.find((x) => x.ownerId === owner && x.mes === m && x.area === area)?.score;

  const getScoreForView = (m: string) => (areaId: string): number | undefined => {
    if (activeView === "media") {
      const vals = adultProfiles.map((p) => scoreFor(p.id, m, areaId)).filter((v): v is number => v !== undefined);
      if (vals.length === 0) return undefined;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    return scoreFor(activeView, m, areaId);
  };

  const avgFor = (m: string): number | null => {
    const getScore = getScoreForView(m);
    const vals = WHEEL_AREAS.map((a) => getScore(a.id)).filter((v): v is number => v !== undefined);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const saveDraft = async () => {
    if (!profileId) return;
    setSaving(true);
    for (const area of WHEEL_AREAS) {
      await upsertWheelScore(mes, area.id, draft[area.id] ?? 5, profileId);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
  };

  if (!entries) return null;

  const avgNow = avgFor(mes);
  const avgPrev = avgFor(shiftMonth(mes, -1));
  const isMe = activeView === profileId;

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de mes */}
      <div className="flex items-center justify-center gap-4 rounded-3xl bg-white p-3 shadow-sm dark:bg-zinc-900">
        <button onClick={() => setMes(shiftMonth(mes, -1))} className="rounded-full px-3 py-1 text-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          ‹
        </button>
        <span className="min-w-[110px] text-center text-sm font-semibold capitalize text-zinc-800 dark:text-zinc-100">
          {monthLabel(mes)}
        </span>
        <button
          onClick={() => setMes(shiftMonth(mes, 1))}
          disabled={mes >= currentMonthStr()}
          className="rounded-full px-3 py-1 text-lg text-zinc-400 enabled:hover:text-zinc-700 disabled:opacity-30 dark:enabled:hover:text-zinc-200"
        >
          ›
        </button>
      </div>

      {/* Rueda + media */}
      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
          {adultProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setView(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeView === p.id
                  ? "bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {PROFILE_DISPLAY_NAMES[p.name]}
            </button>
          ))}
          <button
            onClick={() => setView("media")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeView === "media"
                ? "bg-rose-500 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Media pareja
          </button>
        </div>

        <WheelSvg getScore={getScoreForView(mes)} />

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{avgNow !== null ? avgNow.toFixed(1) : "—"}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">media del mes</p>
          </div>
          {avgNow !== null && avgPrev !== null && (
            <TrendBadge current={Math.round(avgNow * 10)} previous={Math.round(avgPrev * 10)} />
          )}
        </div>
      </div>

      {/* Editor de tu puntuación */}
      {isMe && profile && (
        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="font-medium text-zinc-800 dark:text-zinc-100">
            Tu puntuación — {PROFILE_DISPLAY_NAMES[profile.name]}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Puntúa cada área del 1 al 10. Hazlo una vez al mes para ver cómo evoluciona.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {WHEEL_AREAS.map((area) => (
              <div key={area.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">{area.label}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={draft[area.id] ?? 5}
                  onChange={(e) => setDraft((d) => ({ ...d, [area.id]: Number(e.target.value) }))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-500 dark:bg-zinc-700"
                  style={{ accentColor: area.color }}
                />
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {draft[area.id] ?? 5}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={saveDraft}
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar puntuación del mes"}
          </button>
        </div>
      )}
      {!isMe && (
        <button
          onClick={() => profileId && setView(profileId)}
          className="rounded-2xl border border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400"
        >
          ← Volver a mi puntuación para editarla
        </button>
      )}
    </div>
  );
}
