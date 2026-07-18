"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { DumbbellIcon } from "@/components/icons";
import { useProfile } from "@/lib/profile-context";
import { PROFILE_DISPLAY_NAMES } from "@/lib/types";
import { useFitnessState } from "@/lib/useFitnessState";
import { buildRoutine } from "@/lib/fitness-routines";
import { Weekday, volumeOfSets } from "@/lib/fitness-types";
import { FitnessDayPills } from "@/components/FitnessDayPills";
import { FitnessExerciseCard } from "@/components/FitnessExerciseCard";
import { FitnessWeeklyBalance } from "@/components/FitnessWeeklyBalance";
import { FitnessExercisePicker } from "@/components/FitnessExercisePicker";
import { FitnessGamificationCard } from "@/components/FitnessGamificationCard";
import { FitnessCoupleModal } from "@/components/FitnessCoupleModal";
import { FitnessAchievementsModal } from "@/components/FitnessAchievementsModal";
import { FitnessCelebrationOverlay } from "@/components/FitnessCelebrationOverlay";
import { FitnessRoutinesModal } from "@/components/FitnessRoutinesModal";
import { FitnessWellnessCard } from "@/components/FitnessWellnessCard";
import { FitnessStatsModal } from "@/components/FitnessStatsModal";

export default function EntrenoPage() {
  const { profileId, adultProfiles } = useProfile();
  const f = useFitnessState(profileId ?? "", adultProfiles);

  const [selectedDay, setSelectedDay] = useState<Weekday>(f.todayWeekday);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [coupleOpen, setCoupleOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [routinesOpen, setRoutinesOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  if (!profileId || !f.loaded) {
    return (
      <>
        <Header backHref="/app" />
        <main className="flex flex-1 items-center justify-center px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
          Cargando...
        </main>
      </>
    );
  }

  const dayExercises = f.routine[selectedDay];
  const doneCount = dayExercises.filter((e) => e.done).length;
  const dayVolume = dayExercises.reduce((n, e) => n + volumeOfSets(e.sets), 0);
  const partnerTrained = f.couple.partnersTrained[0];

  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 flex items-center gap-2">
            <DumbbellIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Entreno</h1>
          </div>

          <div className="flex flex-col gap-4">
            <FitnessDayPills
              routine={f.routine}
              selected={selectedDay}
              today={f.todayWeekday}
              onSelect={setSelectedDay}
            />

            <FitnessGamificationCard
              f={f}
              onOpenCouple={() => setCoupleOpen(true)}
              onOpenAchievements={() => setAchievementsOpen(true)}
            />

            {partnerTrained && !f.couple.bothTrainedToday && (
              <button
                onClick={() => setCoupleOpen(true)}
                className="rounded-xl bg-pink-50 px-4 py-2.5 text-left text-sm text-pink-700 ring-1 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-200 dark:ring-pink-500/20"
              >
                👀 {PROFILE_DISPLAY_NAMES[partnerTrained.profile.name]} ya ha entrenado hoy. ¡No rompas la racha de
                pareja!
              </button>
            )}

            <FitnessWellnessCard f={f} />

            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selectedDay}</h2>
              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-lg font-bold leading-none text-zinc-900 dark:text-white">
                    {doneCount}/{dayExercises.length}
                  </div>
                  <div className="text-[11px] font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
                    HECHOS
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold leading-none tabular-nums text-zinc-900 dark:text-white">
                    {dayVolume.toLocaleString("es-ES")}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">kg</span>
                  </div>
                  <div className="text-[11px] font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
                    VOLUMEN
                  </div>
                </div>
              </div>
            </div>

            {dayExercises.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-3 text-4xl">🏋️</div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Día de descanso… ¿o no?</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Todavía no hay ejercicios para {selectedDay.toLowerCase()}.
                </p>
                <button
                  onClick={() => setRoutinesOpen(true)}
                  className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  ✨ Elegir una rutina guiada
                </button>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">o añade ejercicios sueltos abajo</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {dayExercises.map((ex) => (
                  <li key={ex.id}>
                    <FitnessExerciseCard
                      exercise={ex}
                      onAddSet={(w, r, i) => {
                        const isFirstSet = ex.sets.length === 0;
                        f.addSet(selectedDay, ex.id, { weight: w, reps: r, intensity: i });
                        f.logSet(i, isFirstSet);
                      }}
                      onRemoveSet={(setId) => f.removeSet(selectedDay, ex.id, setId)}
                      onToggleDone={() => f.toggleDone(selectedDay, ex.id)}
                      onRemove={() => f.removeExerciseFromDay(selectedDay, ex.id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPickerOpen(true)}
                className="flex-1 rounded-2xl bg-white py-3.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                + Añadir ejercicio
              </button>
              <button
                onClick={() => setRoutinesOpen(true)}
                className="flex-shrink-0 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                title="Rutinas guiadas"
              >
                ✨ Rutinas
              </button>
              <button
                onClick={() => setStatsOpen(true)}
                className="flex-shrink-0 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                title="Progreso"
              >
                📊
              </button>
            </div>

            <FitnessWeeklyBalance routine={f.routine} />

            <p className="pt-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
              Imágenes ©{" "}
              <a href="https://gymvisual.com/" target="_blank" rel="noopener noreferrer" className="underline">
                Gym visual
              </a>
              . Datos: dataset hasaneyldrm/exercises-dataset (MIT).
            </p>
          </div>
        </div>
      </main>

      {pickerOpen && (
        <FitnessExercisePicker
          dayLabel={selectedDay}
          exercises={f.exercises}
          onCreateCustom={f.addCustomExercise}
          onPick={(exercise) => {
            f.addExerciseToDay(selectedDay, exercise);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {routinesOpen && (
        <FitnessRoutinesModal
          onApply={(template) => {
            f.replaceRoutine(buildRoutine(template));
            setRoutinesOpen(false);
          }}
          onClose={() => setRoutinesOpen(false)}
        />
      )}

      {coupleOpen && <FitnessCoupleModal f={f} onClose={() => setCoupleOpen(false)} />}
      {achievementsOpen && <FitnessAchievementsModal f={f} onClose={() => setAchievementsOpen(false)} />}
      {statsOpen && <FitnessStatsModal f={f} onClose={() => setStatsOpen(false)} />}
      {f.celebrations[0] && (
        <FitnessCelebrationOverlay celebration={f.celebrations[0]} onDismiss={f.dismissCelebration} />
      )}
    </>
  );
}
