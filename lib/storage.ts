"use client";

import { supabase } from "./supabase";
import {
  AmountItem,
  Deseo,
  FinanceEntry,
  FinanceGoal,
  FinanceScope,
  Habit,
  HabitKey,
  HabitStatus,
  LifeContact,
  ListItem,
  LogEntry,
  Meal,
  MealTipo,
  PersonalContent,
  ProfileId,
  Recipe,
  Relacion,
  Visibility,
  WorkSession,
} from "./types";

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- Habits (catálogo) ----

function mapHabit(r: Record<string, unknown>): Habit {
  return {
    key: r.key as string,
    label: r.label as string,
    area: r.area as Habit["area"],
    dimension: r.dimension as Habit["dimension"],
    status: r.status as HabitStatus,
    multiCheck: (r.multi_check as boolean) ?? false,
    metaDiaria: (r.meta_diaria as number) ?? undefined,
  };
}

export async function getHabits(filter?: { status?: HabitStatus; area?: string; dimension?: string }): Promise<Habit[]> {
  let query = supabase.from("habits").select("*");
  if (filter?.status) query = query.eq("status", filter.status);
  if (filter?.area) query = query.eq("area", filter.area);
  if (filter?.dimension) query = query.eq("dimension", filter.dimension);
  const { data } = await query;
  return (data ?? []).map(mapHabit);
}

export async function getHabit(key: HabitKey): Promise<Habit | undefined> {
  const { data } = await supabase.from("habits").select("*").eq("key", key).maybeSingle();
  return data ? mapHabit(data) : undefined;
}

export async function setHabitStatus(key: HabitKey, status: HabitStatus): Promise<void> {
  await supabase.from("habits").update({ status }).eq("key", key);
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export async function addHabit(label: string, area: string, dimension: string): Promise<void> {
  const base = slugify(label) || "habito";
  let key = base;
  let n = 1;
  while (await getHabit(key)) {
    key = `${base}_${++n}`;
  }
  const { error } = await supabase.from("habits").insert({ key, label, area, dimension, status: "active" });
  if (error) throw new Error(error.message);
}

// ---- Habit logs ----

export async function getHabitLog(habitKey: HabitKey, profileId: ProfileId, date: string): Promise<boolean> {
  const { data } = await supabase
    .from("habit_logs")
    .select("completed")
    .eq("habit_key", habitKey)
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();
  return !!data?.completed;
}

export async function toggleHabitLog(habitKey: HabitKey, profileId: ProfileId, date: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id, completed")
    .eq("habit_key", habitKey)
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();

  if (!existing) {
    await supabase.from("habit_logs").insert({ habit_key: habitKey, profile_id: profileId, date, completed: true });
    return true;
  }
  const nowCompleted = !existing.completed;
  await supabase.from("habit_logs").update({ completed: nowCompleted }).eq("id", existing.id);
  return nowCompleted;
}

export async function getHabitCount(habitKey: HabitKey, profileId: ProfileId, date: string): Promise<number> {
  const { data } = await supabase
    .from("habit_logs")
    .select("count")
    .eq("habit_key", habitKey)
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();
  return data?.count ?? 0;
}

export async function incrementHabitCount(
  habitKey: HabitKey,
  profileId: ProfileId,
  date: string,
  meta: number
): Promise<number> {
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id, count")
    .eq("habit_key", habitKey)
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();

  if (!existing) {
    await supabase
      .from("habit_logs")
      .insert({ habit_key: habitKey, profile_id: profileId, date, count: 1, completed: 1 >= meta });
    return 1;
  }
  const count = (existing.count ?? 0) + 1;
  await supabase.from("habit_logs").update({ count, completed: count >= meta }).eq("id", existing.id);
  return count;
}

export async function getHabitStreak(habitKey: HabitKey, profileId: ProfileId): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 120);
  const { data } = await supabase
    .from("habit_logs")
    .select("date, completed")
    .eq("habit_key", habitKey)
    .eq("profile_id", profileId)
    .eq("completed", true)
    .gte("date", since.toISOString().slice(0, 10));

  const completedDates = new Set((data ?? []).map((l) => l.date as string));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (completedDates.has(dateStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function badgeForStreak(streak: number): string | null {
  if (streak >= 100) return "🏆";
  if (streak >= 30) return "🥈";
  if (streak >= 7) return "🥉";
  return null;
}

// ---- Gamificación ----

export async function getTotalXP(profileId: ProfileId): Promise<number> {
  const { count } = await supabase
    .from("habit_logs")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("completed", true);
  return (count ?? 0) * 10;
}

// Meta diaria compuesta: cada hábito suelto (no perteneciente a un ritual) cuenta
// como 1 item, y cada ritual completo (todos sus pasos) cuenta como 1 item más.
export async function getTodayProgress(
  profileId: ProfileId,
  ritualStepKeys: Set<string>,
  ritualCount: number
): Promise<{ done: number; total: number }> {
  const today = todayStr();
  const active = await getHabits({ status: "active" });
  const loose = active.filter((h) => !ritualStepKeys.has(h.key));

  const { data } = await supabase
    .from("habit_logs")
    .select("habit_key")
    .eq("profile_id", profileId)
    .eq("date", today)
    .eq("completed", true);
  const doneKeys = new Set((data ?? []).map((l) => l.habit_key as string));

  const looseDone = loose.filter((h) => doneKeys.has(h.key)).length;

  return { done: looseDone, total: loose.length + ritualCount };
}

export async function getRitualDoneToday(profileId: ProfileId, stepKeys: string[]): Promise<boolean> {
  if (stepKeys.length === 0) return false;
  const today = todayStr();
  const { data } = await supabase
    .from("habit_logs")
    .select("habit_key")
    .eq("profile_id", profileId)
    .eq("date", today)
    .eq("completed", true)
    .in("habit_key", stepKeys);
  const done = new Set((data ?? []).map((l) => l.habit_key as string));
  return stepKeys.every((k) => done.has(k));
}

export async function getWeeklyCounts(profileId: ProfileId): Promise<{ date: string; count: number }[]> {
  const cursor = new Date();
  const start = new Date(cursor);
  start.setDate(cursor.getDate() - 6);
  const { data } = await supabase
    .from("habit_logs")
    .select("date")
    .eq("profile_id", profileId)
    .eq("completed", true)
    .gte("date", start.toISOString().slice(0, 10));

  const counts: Record<string, number> = {};
  (data ?? []).forEach((l) => {
    const d = l.date as string;
    counts[d] = (counts[d] ?? 0) + 1;
  });

  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, count: counts[dateStr] ?? 0 });
  }
  return days;
}

export async function getRitualProgress(
  stepKeys: string[],
  profileId: ProfileId,
  date: string
): Promise<{ done: number; total: number }> {
  if (stepKeys.length === 0) return { done: 0, total: 0 };
  const { data } = await supabase
    .from("habit_logs")
    .select("habit_key")
    .eq("profile_id", profileId)
    .eq("date", date)
    .eq("completed", true)
    .in("habit_key", stepKeys);
  const done = new Set((data ?? []).map((l) => l.habit_key as string));
  return { done: stepKeys.filter((k) => done.has(k)).length, total: stepKeys.length };
}

export async function getRitualStreak(stepKeys: string[], profileId: ProfileId): Promise<number> {
  if (stepKeys.length === 0) return 0;
  const since = new Date();
  since.setDate(since.getDate() - 120);
  const { data } = await supabase
    .from("habit_logs")
    .select("date, habit_key")
    .eq("profile_id", profileId)
    .eq("completed", true)
    .in("habit_key", stepKeys)
    .gte("date", since.toISOString().slice(0, 10));

  const byDate = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const d = row.date as string;
    if (!byDate.has(d)) byDate.set(d, new Set());
    byDate.get(d)!.add(row.habit_key as string);
  }

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const doneSet = byDate.get(dateStr);
    if (doneSet && doneSet.size >= stepKeys.length) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ---- Meals ----

function mapMeal(r: Record<string, unknown>): Meal {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    date: r.date as string,
    tipo: r.tipo as MealTipo,
    nota: r.nota as string,
  };
}

export async function getMeals(): Promise<Meal[]> {
  const { data } = await supabase.from("meals").select("*").order("date", { ascending: false });
  return (data ?? []).map(mapMeal);
}

export async function addMeal(profileId: ProfileId, tipo: MealTipo, nota: string, visibility: Visibility) {
  await supabase.from("meals").insert({ owner_id: profileId, visibility, date: todayStr(), tipo, nota });
}

export async function deleteMeal(id: string) {
  await supabase.from("meals").delete().eq("id", id);
}

// ---- Finance ----

function mapFinanceEntry(r: Record<string, unknown>): FinanceEntry {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    scope: r.scope as FinanceScope,
    tipo: r.tipo as FinanceEntry["tipo"],
    monto: Number(r.monto),
    descripcion: r.descripcion as string,
    fecha: r.fecha as string,
  };
}

export async function getFinanceEntries(scope: FinanceScope): Promise<FinanceEntry[]> {
  const { data } = await supabase
    .from("finance_entries")
    .select("*")
    .eq("scope", scope)
    .order("fecha", { ascending: false });
  return (data ?? []).map(mapFinanceEntry);
}

export async function addFinanceEntry(
  scope: FinanceScope,
  tipo: FinanceEntry["tipo"],
  monto: number,
  descripcion: string,
  profileId: ProfileId,
  visibility: Visibility
) {
  await supabase
    .from("finance_entries")
    .insert({ owner_id: profileId, visibility, scope, tipo, monto, descripcion, fecha: todayStr() });
}

export async function deleteFinanceEntry(id: string) {
  await supabase.from("finance_entries").delete().eq("id", id);
}

function mapFinanceGoal(r: Record<string, unknown>): FinanceGoal {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    scope: r.scope as FinanceScope,
    nombre: r.nombre as string,
    montoObjetivo: Number(r.monto_objetivo),
    montoActual: Number(r.monto_actual),
  };
}

export async function getFinanceGoals(scope: FinanceScope): Promise<FinanceGoal[]> {
  const { data } = await supabase.from("finance_goals").select("*").eq("scope", scope);
  return (data ?? []).map(mapFinanceGoal);
}

export async function addFinanceGoal(
  scope: FinanceScope,
  nombre: string,
  montoObjetivo: number,
  profileId: ProfileId,
  visibility: Visibility
) {
  await supabase
    .from("finance_goals")
    .insert({ owner_id: profileId, visibility, scope, nombre, monto_objetivo: montoObjetivo, monto_actual: 0 });
}

export async function updateFinanceGoalAmount(id: string, montoActual: number) {
  await supabase.from("finance_goals").update({ monto_actual: montoActual }).eq("id", id);
}

export async function deleteFinanceGoal(id: string) {
  await supabase.from("finance_goals").delete().eq("id", id);
}

// ---- Logs genéricos (journal/diario) ----

function mapLogEntry(r: Record<string, unknown>): LogEntry {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    blockKey: r.block_key as string,
    categoria: r.categoria as string,
    nota: r.nota as string,
    monto: r.monto != null ? Number(r.monto) : undefined,
    date: r.date as string,
  };
}

export async function getLogs(blockKey: string): Promise<LogEntry[]> {
  const { data } = await supabase
    .from("logs")
    .select("*")
    .eq("block_key", blockKey)
    .order("date", { ascending: false });
  return (data ?? []).map(mapLogEntry);
}

export async function addLogEntry(
  blockKey: string,
  categoria: string,
  nota: string,
  profileId: ProfileId,
  visibility: Visibility,
  monto?: number
) {
  await supabase
    .from("logs")
    .insert({ owner_id: profileId, visibility, block_key: blockKey, categoria, nota, monto, date: todayStr() });
}

export async function deleteLogEntry(id: string) {
  await supabase.from("logs").delete().eq("id", id);
}

// ---- Listas genéricas (checklist sin fecha) ----

function mapListItem(r: Record<string, unknown>): ListItem {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    blockKey: r.block_key as string,
    titulo: r.titulo as string,
    hecho: r.hecho as boolean,
    hechoDate: (r.hecho_date as string) ?? null,
    asignadoA: (r.asignado_a as string) ?? null,
    categoria: (r.categoria as string) ?? null,
  };
}

export async function getListItems(blockKey: string): Promise<ListItem[]> {
  const { data } = await supabase.from("lists").select("*").eq("block_key", blockKey);
  return (data ?? []).map(mapListItem);
}

export async function addListItem(
  blockKey: string,
  titulo: string,
  asignadoA: ProfileId | null,
  profileId: ProfileId,
  visibility: Visibility,
  categoria: string | null = null
) {
  await supabase.from("lists").insert({
    owner_id: profileId,
    visibility,
    block_key: blockKey,
    titulo,
    hecho: false,
    asignado_a: asignadoA,
    categoria,
  });
}

export async function toggleListItem(id: string, currentHecho: boolean, dailyReset = false) {
  if (dailyReset) {
    const willBeDone = !currentHecho;
    await supabase
      .from("lists")
      .update({ hecho: willBeDone, hecho_date: willBeDone ? todayStr() : null })
      .eq("id", id);
  } else {
    await supabase.from("lists").update({ hecho: !currentHecho }).eq("id", id);
  }
}

export async function deleteListItem(id: string) {
  await supabase.from("lists").delete().eq("id", id);
}

// ---- Mini-ledgers con importe (ingresos, patrimonio, gastos fijos) ----

function mapAmountItem(r: Record<string, unknown>): AmountItem {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    blockKey: r.block_key as string,
    nombre: r.nombre as string,
    monto: Number(r.monto),
  };
}

export async function getAmountItems(blockKey: string): Promise<AmountItem[]> {
  const { data } = await supabase.from("amount_items").select("*").eq("block_key", blockKey);
  return (data ?? []).map(mapAmountItem);
}

export async function addAmountItem(
  blockKey: string,
  nombre: string,
  monto: number,
  profileId: ProfileId,
  visibility: Visibility
) {
  await supabase.from("amount_items").insert({ owner_id: profileId, visibility, block_key: blockKey, nombre, monto });
}

export async function deleteAmountItem(id: string) {
  await supabase.from("amount_items").delete().eq("id", id);
}

// ---- Contenido personal (decretos, agradecimientos, deseos) — siempre privado ----

const EMPTY_PERSONAL_CONTENT: PersonalContent = {
  decretos: [],
  agradecimientos: [],
  deseos: [],
  musicaDecretos: [],
  musicaVisualizacion: [],
};

function mapPersonalContent(r: Record<string, unknown>): PersonalContent {
  return {
    decretos: (r.decretos as string[]) ?? [],
    agradecimientos: (r.agradecimientos as string[]) ?? [],
    deseos: (r.deseos as Deseo[]) ?? [],
    musicaDecretos: (r.musica_decretos as string[]) ?? [],
    musicaVisualizacion: (r.musica_visualizacion as string[]) ?? [],
  };
}

export async function getPersonalContent(profileId: ProfileId): Promise<PersonalContent> {
  const { data } = await supabase.from("personal_content").select("*").eq("owner_id", profileId).maybeSingle();
  return data ? mapPersonalContent(data) : EMPTY_PERSONAL_CONTENT;
}

async function upsertPersonalContent(profileId: ProfileId, patch: Partial<Record<string, unknown>>) {
  await supabase.from("personal_content").upsert({ owner_id: profileId, ...patch }, { onConflict: "owner_id" });
}

export async function seedPersonalContent(
  profileId: ProfileId,
  content: {
    decretos: string[];
    agradecimientos: string[];
    deseos: string[];
    musicaDecretos: string[];
    musicaVisualizacion: string[];
  }
) {
  await upsertPersonalContent(profileId, {
    decretos: content.decretos,
    agradecimientos: content.agradecimientos,
    deseos: content.deseos.map((texto) => ({ id: crypto.randomUUID(), texto })),
    musica_decretos: content.musicaDecretos,
    musica_visualizacion: content.musicaVisualizacion,
  });
}

export async function setDecretos(profileId: ProfileId, decretos: string[]) {
  await upsertPersonalContent(profileId, { decretos });
}

export async function setAgradecimientos(profileId: ProfileId, agradecimientos: string[]) {
  await upsertPersonalContent(profileId, { agradecimientos });
}

export async function addDeseo(profileId: ProfileId, texto: string) {
  const current = await getPersonalContent(profileId);
  const deseos = [...current.deseos, { id: crypto.randomUUID(), texto }];
  await upsertPersonalContent(profileId, { deseos });
}

export async function deleteDeseo(profileId: ProfileId, id: string) {
  const current = await getPersonalContent(profileId);
  const deseos = current.deseos.filter((d) => d.id !== id);
  await upsertPersonalContent(profileId, { deseos });
}

// ---- Red de la vida ----

function mapLifeContact(r: Record<string, unknown>): LifeContact {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    nombre: r.nombre as string,
    relacion: r.relacion as Relacion,
    cadenciaDias: r.cadencia_dias as number,
    ultimoContacto: (r.ultimo_contacto as string) ?? null,
    notas: (r.notas as string) ?? "",
  };
}

export async function getLifeContacts(): Promise<LifeContact[]> {
  const { data } = await supabase.from("life_contacts").select("*");
  return (data ?? []).map(mapLifeContact);
}

export async function addLifeContact(
  nombre: string,
  relacion: Relacion,
  cadenciaDias: number,
  profileId: ProfileId,
  visibility: Visibility
) {
  await supabase
    .from("life_contacts")
    .insert({ owner_id: profileId, visibility, nombre, relacion, cadencia_dias: cadenciaDias, ultimo_contacto: null });
}

export async function markContacted(id: string) {
  await supabase.from("life_contacts").update({ ultimo_contacto: todayStr() }).eq("id", id);
}

export async function deleteLifeContact(id: string) {
  await supabase.from("life_contacts").delete().eq("id", id);
}

export function isOverdue(contact: LifeContact): boolean {
  if (!contact.ultimoContacto) return true;
  const last = new Date(contact.ultimoContacto + "T00:00:00");
  const diffDays = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > contact.cadenciaDias;
}

// ---- Cronómetro de trabajo (siempre privado, sin UI de visibilidad) ----

export async function addWorkSession(profileId: ProfileId, minutos: number) {
  if (minutos <= 0) return;
  await supabase
    .from("work_sessions")
    .insert({ profile_id: profileId, date: todayStr(), minutos: Math.round(minutos) });
}

export async function getTodayWorkMinutes(profileId: ProfileId): Promise<number> {
  const { data } = await supabase
    .from("work_sessions")
    .select("minutos")
    .eq("profile_id", profileId)
    .eq("date", todayStr());
  return (data ?? []).reduce((acc, s) => acc + (s.minutos as number), 0);
}

// ---- Recetas ----

function mapRecipe(r: Record<string, unknown>): Recipe {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    visibility: r.visibility as Visibility,
    nombre: r.nombre as string,
    ingredientes: r.ingredientes as string,
    instrucciones: r.instrucciones as string,
    favorita: r.favorita as boolean,
    probada: r.probada as boolean,
    status: r.status as Recipe["status"],
    imagenUrl: (r.imagen_url as string) || undefined,
    videoUrl: (r.video_url as string) || undefined,
  };
}

export async function getRecipes(status: Recipe["status"] = "active"): Promise<Recipe[]> {
  const { data, error } = await supabase.from("recipes").select("*").eq("status", status).order("nombre");
  if (error) console.error("No se pudo leer 'recipes' — ¿está la tabla al día en Supabase?", error.message);
  return (data ?? []).map(mapRecipe);
}

export async function addRecipe(
  nombre: string,
  ingredientes: string,
  instrucciones: string,
  profileId: ProfileId,
  visibility: Visibility,
  status: Recipe["status"] = "active",
  favorita = false,
  imagenUrl?: string,
  videoUrl?: string
) {
  const { error } = await supabase.from("recipes").insert({
    owner_id: profileId,
    visibility,
    nombre,
    ingredientes,
    instrucciones,
    favorita,
    probada: false,
    status,
    imagen_url: imagenUrl || null,
    video_url: videoUrl || null,
  });
  if (error) throw new Error(error.message);
}

export async function toggleRecipeFavorita(id: string, current: boolean) {
  await supabase.from("recipes").update({ favorita: !current }).eq("id", id);
}

export async function toggleRecipeProbada(id: string, current: boolean) {
  await supabase.from("recipes").update({ probada: !current }).eq("id", id);
}

export async function setRecipeStatus(id: string, status: Recipe["status"]) {
  await supabase.from("recipes").update({ status }).eq("id", id);
}

export async function deleteRecipe(id: string) {
  await supabase.from("recipes").delete().eq("id", id);
}

export type { WorkSession };
