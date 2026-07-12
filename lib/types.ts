export type ProfileId = string; // uuid de auth.users / profiles.id
export type ProfileName = "jose" | "viviana" | "dylan";
export type ProfileRole = "adult" | "child";

export interface Profile {
  id: ProfileId;
  name: ProfileName;
  role: ProfileRole;
}

export const PROFILE_DISPLAY_NAMES: Record<ProfileName, string> = {
  jose: "Jose",
  viviana: "Viviana",
  dylan: "Dylan",
};

export const PROFILE_AVATAR_COLOR: Record<ProfileName, string> = {
  jose: "bg-sky-500",
  viviana: "bg-rose-500",
  dylan: "bg-orange-500",
};

export type Visibility = "private" | "shared";

export type Area = "salud" | "dinero" | "amor";
export type Dimension = "cuerpo" | "alma" | "mente" | "espiritu";

// Antes era un union type fijo; ahora los hábitos son datos (ver Habit) y esto
// es solo el tipo de la clave libre que los identifica.
export type HabitKey = string;

export type HabitStatus = "active" | "suggested" | "declined";

export interface Habit {
  key: HabitKey;
  label: string;
  area: Area;
  dimension: Dimension;
  status: HabitStatus;
  multiCheck?: boolean; // ej. agua: cada tap suma en vez de alternar
  metaDiaria?: number; // objetivo diario para multiCheck (ej. 8 vasos)
  ritualKey?: string; // si es un paso de ritual: a qué ritual pertenece
  ritualGroup?: string; // subgrupo dentro del ritual (ej. bienestar: mañana/noche)
  sortOrder?: number; // orden dentro del ritual
  icon?: string; // emoji mostrado en RitualBlock
  timeLabel?: string; // hora mostrada en RitualBlock (texto libre, ej. "7:00")
}

export interface HabitLog {
  habitKey: HabitKey;
  profileId: ProfileId;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count?: number; // usado por hábitos multiCheck
}

export type MealTipo = "batido" | "comida" | "snack";

export interface Meal {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  date: string;
  tipo: MealTipo;
  nota: string;
}

export type FinanceScope = "pareja" | "dylan";
export type FinanceTipo = "gasto" | "ingreso";

export interface FinanceEntry {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  scope: FinanceScope;
  tipo: FinanceTipo;
  monto: number;
  descripcion: string;
  fecha: string;
}

export interface FinanceGoal {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  scope: FinanceScope;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
}

// Entradas fechadas tipo diario/journal, reutilizadas por muchas secciones.
export interface LogEntry {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  blockKey: string;
  categoria: string;
  nota: string;
  monto?: number;
  date: string;
}

// Checklist sin fecha (tareas, no-negociables, listas de Dylan, etc.)
export interface ListItem {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  blockKey: string;
  titulo: string;
  hecho: boolean;
  hechoDate: string | null;
  asignadoA: ProfileId | null;
  categoria: string | null;
}

// Mini-ledger con importe, sin "hecho" (ingresos, patrimonio, gastos fijos).
export interface AmountItem {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  blockKey: string;
  nombre: string;
  monto: number;
}

// Contenido personal de manifestación (decretos, agradecimientos, deseos) —
// siempre privado, un registro por perfil.
export interface Deseo {
  id: string;
  texto: string;
}

export interface PersonalContent {
  decretos: string[];
  agradecimientos: string[];
  deseos: Deseo[];
  musicaDecretos: string[];
  musicaVisualizacion: string[];
}

export type Relacion = "amigo" | "familia";

export interface LifeContact {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  nombre: string;
  relacion: Relacion;
  cadenciaDias: number;
  ultimoContacto: string | null; // YYYY-MM-DD
  notas: string;
}

export interface WorkSession {
  id: string;
  profileId: ProfileId;
  date: string;
  minutos: number;
}

export type RecipeStatus = "active" | "suggested" | "declined";

export interface Recipe {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  nombre: string;
  ingredientes: string;
  instrucciones: string;
  favorita: boolean;
  probada: boolean;
  status: RecipeStatus;
  imagenUrl?: string;
  videoUrl?: string;
}

export interface Video {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  titulo: string;
  videoUrl: string;
}

export interface Evento {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  titulo: string;
  url?: string;
  lugar?: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
  imagenUrl?: string;
  asistimos: boolean;
}

// ---- Pareja ----

export type DreamHorizon = 1 | 5 | 10;
export type DreamTipo = "individual" | "pareja";

export interface Dream {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  horizonte: DreamHorizon;
  tipo: DreamTipo;
  texto: string;
  conseguido: boolean;
}

export interface OkrResultado {
  texto: string;
  hecho: boolean;
}

export interface Okr {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  objetivo: string;
  resultados: OkrResultado[];
  fechaFin?: string; // YYYY-MM-DD
}

export interface Reward {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  nombre: string;
  descripcion: string;
  condicion: string;
  imagenUrl?: string;
  conseguido: boolean;
  fechaConseguido?: string; // YYYY-MM-DD
}

export interface CoupleAgreement {
  pactos: string[];
  firmaJose?: string; // YYYY-MM-DD
  firmaViviana?: string; // YYYY-MM-DD
}

export interface WheelEntry {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  mes: string; // YYYY-MM-DD (primer día del mes)
  area: string;
  score: number; // 0-10
}

export interface TaskLogEntry {
  id: string;
  profileId: ProfileId;
  blockKey: string;
  titulo: string;
  categoria?: string;
  date: string; // YYYY-MM-DD
}

export interface Exercise<T = Record<string, unknown>> {
  id: string;
  ownerId: ProfileId;
  visibility: Visibility;
  tipo: string;
  data: T;
}
