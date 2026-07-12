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
}
