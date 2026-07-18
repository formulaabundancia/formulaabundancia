"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllFitnessStates, saveFitnessState } from "./fitness-storage";
import { defaultFitnessState, FitnessState, hydrateFitnessState } from "./fitness-state";
import {
  ACHIEVEMENTS,
  AchievementCtx,
  defaultGami,
  GamiState,
  levelFromXp,
  normalizeGami,
  XP_PER_INTENSITY,
  XP_PER_LEVEL,
  xpIntoLevel,
} from "./fitness-gamification";
import { addDaysIso, diffDays, weekdayFromDate } from "./fitness-date";
import { todayStr } from "./storage";
import { Profile, ProfileId } from "./types";
import {
  FitnessDayExercise,
  FitnessExercise,
  FitnessIntensity,
  FitnessRoutine,
  FitnessSetEntry,
  MuscleGroup,
  newFitnessId,
  volumeOfSets,
  Weekday,
  WEEKDAYS,
} from "./fitness-types";
import { DEFAULT_EXERCISES } from "./fitness-exercise-library";

const SAVE_DEBOUNCE_MS = 400;

export type CelebrationType = "goal" | "level" | "achievement";
export interface Celebration {
  key: number;
  type: CelebrationType;
  title: string;
  subtitle: string;
  emoji: string;
}

export interface CoupleMember {
  profile: Profile;
  xpToday: number;
  trainedToday: boolean;
  streak: number;
  level: number;
  isMe: boolean;
}

export function useFitnessState(profileId: ProfileId, adultProfiles: Profile[]) {
  const [myState, setMyState] = useState<FitnessState>(defaultFitnessState());
  // Estado de la pareja (y cualquier otro adulto), tal como se leyó la última
  // vez — no es en vivo; se refresca al cargar y al abrir el modal de pareja.
  const [partnerStates, setPartnerStates] = useState<Record<ProfileId, FitnessState>>({});
  const [loaded, setLoaded] = useState(false);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const myStateRef = useRef(myState);
  const celebKey = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    myStateRef.current = myState;
  }, [myState]);

  const refetch = useCallback(async () => {
    const rows = await getAllFitnessStates();
    const mine = rows.find((r) => r.ownerId === profileId);
    const normalized = hydrateFitnessState(mine?.data);
    const withGamiNormalized: FitnessState = {
      ...normalized,
      gami: normalizeGami(normalized.gami, todayStr()),
    };
    myStateRef.current = withGamiNormalized;
    setMyState(withGamiNormalized);

    const partners: Record<ProfileId, FitnessState> = {};
    rows
      .filter((r) => r.ownerId !== profileId)
      .forEach((r) => {
        partners[r.ownerId] = hydrateFitnessState(r.data);
      });
    setPartnerStates(partners);
    setLoaded(true);
  }, [profileId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    refetch();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refetch]);

  // Guardado con un pequeño debounce, para no disparar una escritura de red
  // por cada tecla/tap cuando se hacen varios cambios seguidos.
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveFitnessState(profileId, myStateRef.current).catch((err) =>
        console.error("No se pudo guardar el entreno", err)
      );
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [myState, loaded, profileId]);

  const enqueue = useCallback((c: Omit<Celebration, "key">) => {
    celebKey.current += 1;
    setCelebrations((prev) => [...prev, { ...c, key: celebKey.current }]);
  }, []);
  const dismissCelebration = useCallback(() => setCelebrations((prev) => prev.slice(1)), []);

  // ===== Rutina =====
  const setRoutine = useCallback((updater: (prev: FitnessRoutine) => FitnessRoutine) => {
    setMyState((prev) => ({ ...prev, routine: updater(prev.routine) }));
  }, []);

  const addExerciseToDay = useCallback(
    (day: Weekday, exercise: FitnessExercise) => {
      const dayExercise: FitnessDayExercise = {
        id: newFitnessId(),
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: [],
        done: false,
        equipment: exercise.equipment,
        image: exercise.image,
        gif: exercise.gif,
        steps: exercise.steps,
      };
      setRoutine((prev) => ({ ...prev, [day]: [...prev[day], dayExercise] }));
    },
    [setRoutine]
  );

  const removeExerciseFromDay = useCallback(
    (day: Weekday, dayExerciseId: string) => {
      setRoutine((prev) => ({ ...prev, [day]: prev[day].filter((e) => e.id !== dayExerciseId) }));
    },
    [setRoutine]
  );

  const toggleDone = useCallback(
    (day: Weekday, dayExerciseId: string) => {
      setRoutine((prev) => ({
        ...prev,
        [day]: prev[day].map((e) => (e.id === dayExerciseId ? { ...e, done: !e.done } : e)),
      }));
    },
    [setRoutine]
  );

  const addSet = useCallback(
    (day: Weekday, dayExerciseId: string, set: { weight: number; reps: number; intensity: FitnessIntensity }) => {
      const entry: FitnessSetEntry = { id: newFitnessId(), date: todayStr(), ...set };
      setRoutine((prev) => ({
        ...prev,
        [day]: prev[day].map((e) =>
          e.id === dayExerciseId ? { ...e, sets: [...e.sets, entry], done: true } : e
        ),
      }));
    },
    [setRoutine]
  );

  const removeSet = useCallback(
    (day: Weekday, dayExerciseId: string, setId: string) => {
      setRoutine((prev) => ({
        ...prev,
        [day]: prev[day].map((e) =>
          e.id === dayExerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
        ),
      }));
    },
    [setRoutine]
  );

  const replaceRoutine = useCallback((routine: FitnessRoutine) => setRoutine(() => routine), [setRoutine]);

  const addCustomExercise = useCallback((name: string, muscleGroup: MuscleGroup) => {
    const exercise: FitnessExercise = { id: newFitnessId(), name, muscleGroup, isCustom: true };
    setMyState((prev) => ({ ...prev, customExercises: [...prev.customExercises, exercise] }));
    return exercise;
  }, []);

  // ===== Gamificación =====
  const logSet = useCallback(
    (intensity: FitnessIntensity, isFirstSetOfExercise: boolean) => {
      const today = todayStr();
      const gain = XP_PER_INTENSITY[intensity];

      setMyState((prev) => {
        const g = prev.gami;
        const prevToday = g.xpByDate[today] ?? 0;
        const newToday = prevToday + gain;
        const totalXp = g.totalXp + gain;
        const prevLevel = levelFromXp(g.totalXp);
        const newLevel = levelFromXp(totalXp);

        let streak = g.streak;
        let lastActiveDate = g.lastActiveDate;
        let bestStreak = g.bestStreak;
        if (lastActiveDate !== today) {
          if (lastActiveDate == null) {
            streak = 1;
          } else {
            const gap = Math.max(0, diffDays(lastActiveDate, today));
            if (gap === 1) streak = g.streak + 1;
            else if (gap <= 0) streak = Math.max(g.streak, 1);
            else {
              const missed = gap - 1;
              streak = g.freezes >= missed ? g.streak + 1 : 1;
            }
          }
          lastActiveDate = today;
          bestStreak = Math.max(bestStreak, streak);
        }

        const nextGami: GamiState = {
          ...g,
          totalXp,
          streak,
          bestStreak,
          lastActiveDate,
          xpByDate: { ...g.xpByDate, [today]: newToday },
          exercisesCompleted: g.exercisesCompleted + (isFirstSetOfExercise ? 1 : 0),
        };

        if (prevToday < g.dailyGoal && newToday >= g.dailyGoal) {
          enqueue({
            type: "goal",
            emoji: "🎯",
            title: "¡Meta diaria cumplida!",
            subtitle: `Has ganado ${newToday} XP hoy. ¡Sigue así!`,
          });
        }
        if (newLevel > prevLevel) {
          enqueue({
            type: "level",
            emoji: "⭐",
            title: `¡Nivel ${newLevel}!`,
            subtitle: "Has subido de nivel. Cada vez más fuerte.",
          });
        }

        return { ...prev, gami: nextGami };
      });
    },
    [enqueue]
  );

  const syncAchievements = useCallback(
    (ext: { maxDayVolume: number; weekMuscleGroups: number; coupleStreak: number }) => {
      setMyState((prev) => {
        const g = prev.gami;
        const ctx: AchievementCtx = {
          streak: g.streak,
          level: levelFromXp(g.totalXp),
          exercisesCompleted: g.exercisesCompleted,
          maxDayVolume: ext.maxDayVolume,
          weekMuscleGroups: ext.weekMuscleGroups,
          coupleStreak: ext.coupleStreak,
        };
        const newly = ACHIEVEMENTS.filter((a) => !g.unlocked.includes(a.id) && a.test(ctx));
        if (newly.length === 0) return prev;
        newly.forEach((a) =>
          enqueue({
            type: "achievement",
            emoji: a.emoji,
            title: "¡Logro desbloqueado!",
            subtitle: `${a.title} — ${a.description}`,
          })
        );
        return { ...prev, gami: { ...g, unlocked: [...g.unlocked, ...newly.map((a) => a.id)] } };
      });
    },
    [enqueue]
  );

  // ===== Peso corporal =====
  const addBodyWeightEntry = useCallback((weight: number, date = todayStr()) => {
    setMyState((prev) => ({
      ...prev,
      bodyWeightLog: [...prev.bodyWeightLog.filter((e) => e.date !== date), { id: newFitnessId(), date, weight }],
    }));
  }, []);
  const removeBodyWeightEntry = useCallback((id: string) => {
    setMyState((prev) => ({ ...prev, bodyWeightLog: prev.bodyWeightLog.filter((e) => e.id !== id) }));
  }, []);

  // ===== Bienestar (agua/proteína) =====
  const updateWellnessToday = useCallback((updater: (d: { water: number; protein: number }) => { water: number; protein: number }) => {
    const today = todayStr();
    setMyState((prev) => {
      const current = prev.wellnessLog[today] ?? { water: 0, protein: 0 };
      return { ...prev, wellnessLog: { ...prev.wellnessLog, [today]: updater(current) } };
    });
  }, []);
  const addWater = useCallback(
    (delta: number) => updateWellnessToday((d) => ({ ...d, water: Math.max(0, d.water + delta) })),
    [updateWellnessToday]
  );
  const addProtein = useCallback(
    (delta: number) => updateWellnessToday((d) => ({ ...d, protein: Math.max(0, d.protein + delta) })),
    [updateWellnessToday]
  );

  // ===== Derivados =====
  const exercises = useMemo(() => {
    const seen = new Set<string>();
    const merged: FitnessExercise[] = [...DEFAULT_EXERCISES];
    merged.forEach((e) => seen.add(e.id));
    const custom = [...myState.customExercises, ...Object.values(partnerStates).flatMap((s) => s.customExercises)];
    custom.forEach((e) => {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        merged.push(e);
      }
    });
    return merged;
  }, [myState.customExercises, partnerStates]);

  const level = levelFromXp(myState.gami.totalXp);
  const xpInLevel = xpIntoLevel(myState.gami.totalXp);
  const today = todayStr();
  const xpToday = myState.gami.xpByDate[today] ?? 0;

  // ===== Pareja (cooperativo) =====
  const couple = useMemo(() => {
    const allStates: Record<ProfileId, FitnessState> = { [profileId]: myState, ...partnerStates };
    const members: CoupleMember[] = adultProfiles.map((p) => {
      const s = allStates[p.id];
      const g = s?.gami ?? defaultGami();
      const xpTodayP = g.xpByDate[today] ?? 0;
      return {
        profile: p,
        xpToday: xpTodayP,
        trainedToday: xpTodayP > 0,
        streak: g.streak,
        level: levelFromXp(g.totalXp),
        isMe: p.id === profileId,
      };
    });

    const goalPerPerson = myState.gami.dailyGoal;
    const coupleGoal = goalPerPerson * Math.max(1, adultProfiles.length);
    const coupleXpToday = members.reduce((n, m) => n + m.xpToday, 0);

    const allTrained = (day: string) =>
      adultProfiles.length > 0 &&
      adultProfiles.every((p) => ((allStates[p.id]?.gami.xpByDate[day]) ?? 0) > 0);
    let coupleStreak = 0;
    let cursor = today;
    if (!allTrained(cursor)) cursor = addDaysIso(cursor, -1);
    while (allTrained(cursor)) {
      coupleStreak++;
      cursor = addDaysIso(cursor, -1);
    }

    const bothTrainedToday = members.length > 0 && members.every((m) => m.trainedToday);
    const partnersTrained = members.filter((m) => !m.isMe && m.trainedToday);
    const partnersPending = members.filter((m) => !m.isMe && !m.trainedToday);

    return { members, coupleGoal, coupleXpToday, coupleStreak, bothTrainedToday, partnersTrained, partnersPending };
  }, [adultProfiles, profileId, myState, partnerStates, today]);

  // Recalcula logros cuando cambian los datos relevantes.
  useEffect(() => {
    if (!loaded) return;
    let maxVol = 0;
    const groups = new Set<MuscleGroup>();
    WEEKDAYS.forEach((day) => {
      const list = myState.routine[day];
      const vol = list.reduce((n, e) => n + volumeOfSets(e.sets), 0);
      if (vol > maxVol) maxVol = vol;
      list.forEach((e) => groups.add(e.muscleGroup));
    });
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- reacciona a datos ya persistidos, no a un evento */
    syncAchievements({ maxDayVolume: maxVol, weekMuscleGroups: groups.size, coupleStreak: couple.coupleStreak });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, myState.routine, couple.coupleStreak]);

  return {
    loaded,
    routine: myState.routine,
    exercises,
    bodyWeightLog: [...myState.bodyWeightLog].sort((a, b) => (a.date < b.date ? -1 : 1)),
    wellness: myState.wellnessLog[today] ?? { water: 0, protein: 0 },
    todayWeekday: weekdayFromDate(new Date()),
    level,
    xpInLevel,
    xpPerLevel: XP_PER_LEVEL,
    xpToday,
    streak: myState.gami.streak,
    freezes: myState.gami.freezes,
    dailyGoal: myState.gami.dailyGoal,
    unlocked: myState.gami.unlocked,
    totalAchievements: ACHIEVEMENTS.length,
    couple,
    celebrations,
    dismissCelebration,
    refetchPartners: refetch,
    // mutadores
    addExerciseToDay,
    removeExerciseFromDay,
    toggleDone,
    addSet,
    removeSet,
    replaceRoutine,
    addCustomExercise,
    logSet,
    addBodyWeightEntry,
    removeBodyWeightEntry,
    addWater,
    addProtein,
  };
}

export type FitnessData = ReturnType<typeof useFitnessState>;
