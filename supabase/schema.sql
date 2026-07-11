-- Fórmula Abundancia — esquema Supabase (v4: login real + privado/compartido)
-- Pega esto entero en el SQL Editor de tu proyecto Supabase y ejecútalo una vez.

-- ============ PERFILES ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null unique check (name in ('jose', 'viviana', 'dylan')),
  role text not null check (role in ('adult', 'child')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy profiles_select_all on profiles for select
  using (auth.uid() is not null);

create policy profiles_insert_own on profiles for insert
  with check (id = auth.uid());

-- Helper: ¿el usuario actual es adulto (Jose/Viviana)?
create or replace function is_adult() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'adult'
  );
$$ language sql security definer stable;

-- ============ HÁBITOS (catálogo) ============

create table if not exists habits (
  key text primary key,
  label text not null,
  area text not null,
  dimension text not null,
  status text not null default 'suggested' check (status in ('active', 'suggested', 'declined')),
  multi_check boolean not null default false,
  meta_diaria int
);

alter table habits enable row level security;

create policy habits_select_all on habits for select
  using (auth.uid() is not null);

create policy habits_write_adults on habits for all
  using (is_adult()) with check (is_adult());

-- ============ HABIT LOGS ============

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_key text not null references habits(key) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  count int,
  unique (habit_key, profile_id, date)
);

alter table habit_logs enable row level security;

create policy habit_logs_select_all on habit_logs for select
  using (auth.uid() is not null);

create policy habit_logs_write_own on habit_logs for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============ Patrón genérico: owner_id + visibility ============
-- (meals, finance_entries, finance_goals, logs, lists, amount_items, life_contacts)
-- select: dueño siempre, o cualquiera si es 'shared'. write: solo el dueño.

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  date date not null,
  tipo text not null,
  nota text not null default ''
);

create table if not exists finance_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  scope text not null check (scope in ('pareja', 'dylan')),
  tipo text not null check (tipo in ('gasto', 'ingreso')),
  monto numeric not null,
  descripcion text not null,
  fecha date not null
);

create table if not exists finance_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  scope text not null check (scope in ('pareja', 'dylan')),
  nombre text not null,
  monto_objetivo numeric not null,
  monto_actual numeric not null default 0
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  block_key text not null,
  categoria text not null,
  nota text not null,
  monto numeric,
  date date not null
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  block_key text not null,
  titulo text not null,
  hecho boolean not null default false,
  asignado_a uuid references profiles(id)
);

create table if not exists amount_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  block_key text not null,
  nombre text not null,
  monto numeric not null
);

create table if not exists life_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  nombre text not null,
  relacion text not null check (relacion in ('amigo', 'familia')),
  cadencia_dias int not null,
  ultimo_contacto date,
  notas text not null default ''
);

do $$
declare
  t text;
begin
  foreach t in array array['meals', 'finance_entries', 'finance_goals', 'logs', 'lists', 'amount_items', 'life_contacts']
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy %I_select_own_or_shared on %I for select using (owner_id = auth.uid() or visibility = ''shared'')',
      t, t
    );
    execute format('create policy %I_insert_own on %I for insert with check (owner_id = auth.uid())', t, t);
    execute format('create policy %I_update_own on %I for update using (owner_id = auth.uid())', t, t);
    execute format('create policy %I_delete_own on %I for delete using (owner_id = auth.uid())', t, t);
  end loop;
end $$;

-- ============ CONTENIDO PERSONAL (siempre privado) ============

create table if not exists personal_content (
  owner_id uuid primary key references profiles(id) on delete cascade,
  decretos text[] not null default '{}',
  agradecimientos text[] not null default '{}',
  deseos jsonb not null default '[]',
  musica_decretos text[] not null default '{}',
  musica_visualizacion text[] not null default '{}'
);

alter table personal_content enable row level security;

create policy personal_content_own on personal_content for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ============ CRONÓMETRO DE TRABAJO (siempre privado, sin selector en UI) ============

create table if not exists work_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  minutos int not null
);

alter table work_sessions enable row level security;

create policy work_sessions_own on work_sessions for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============ SEED de hábitos (catálogo inicial) ============

insert into habits (key, label, area, dimension, status, multi_check, meta_diaria) values
  ('deporte', 'Deporte', 'salud', 'cuerpo', 'active', false, null),
  ('agua', 'Agua (alcalina)', 'salud', 'cuerpo', 'active', true, 8),
  ('juego_dylan', 'Tiempo de juego con Dylan', 'salud', 'cuerpo', 'active', false, null),
  ('manana_despertar_agua', 'Despertar + agua + sin móvil', 'salud', 'alma', 'active', false, null),
  ('manana_bano', 'Baño/ducha + dientes', 'salud', 'alma', 'active', false, null),
  ('manana_agradecer_meditar', 'Agradecer + afirmaciones + meditación', 'salud', 'alma', 'active', false, null),
  ('manana_journal_objetivo', 'Journaling + objetivo del día', 'salud', 'alma', 'active', false, null),
  ('manana_lectura', 'Lectura — 30 min', 'salud', 'alma', 'active', false, null),
  ('noche_ducha', 'Ducha nocturna + higiene', 'salud', 'espiritu', 'active', false, null),
  ('noche_revision_dia', 'Revisión del día', 'salud', 'espiritu', 'active', false, null),
  ('noche_aprendizajes', '3 cosas que aprendí hoy', 'salud', 'espiritu', 'active', false, null),
  ('noche_planear_manana', 'Planear mañana', 'salud', 'espiritu', 'active', false, null),
  ('noche_lectura', 'Lectura relajante', 'salud', 'espiritu', 'active', false, null),
  ('skincare_limpieza', 'Limpieza facial', 'salud', 'cuerpo', 'active', false, null),
  ('skincare_tonico', 'Tónico', 'salud', 'cuerpo', 'active', false, null),
  ('skincare_serum', 'Sérum', 'salud', 'cuerpo', 'active', false, null),
  ('skincare_hidratante', 'Hidratante', 'salud', 'cuerpo', 'active', false, null),
  ('skincare_spf', 'Protector solar', 'salud', 'cuerpo', 'active', false, null),
  ('wc', 'WC (rutina digestiva matutina)', 'salud', 'cuerpo', 'suggested', false, null),
  ('dientes_mano_izquierda', 'Dientes con la mano izquierda', 'salud', 'cuerpo', 'suggested', false, null),
  ('vaso_limon', 'Vaso de limón', 'salud', 'cuerpo', 'suggested', false, null),
  ('desayunar', 'Desayunar con consciencia', 'salud', 'cuerpo', 'suggested', false, null),
  ('energia_tony_robbins', 'Subir la energía (Tony Robbins)', 'salud', 'alma', 'suggested', false, null),
  ('estudiar_desarrollo', 'Estudiar desarrollo personal', 'salud', 'mente', 'suggested', false, null)
on conflict (key) do nothing;
