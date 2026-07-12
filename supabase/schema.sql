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
  meta_diaria int,
  -- Composición de rituales editable desde la app (en vez de código fijo):
  ritual_key text, -- 'manana' | 'noche' | 'bienestar' | 'skincare', null si no es paso de ritual
  ritual_group text, -- solo bienestar: 'manana' | 'noche'
  sort_order int,
  icon text,
  time_label text
);

-- Por si la tabla ya existía de una ejecución anterior sin estas columnas.
alter table habits add column if not exists ritual_key text;
alter table habits add column if not exists ritual_group text;
alter table habits add column if not exists sort_order int;
alter table habits add column if not exists icon text;
alter table habits add column if not exists time_label text;

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

-- El índice único de arriba es (habit_key, profile_id, date) — no sirve para las
-- consultas por perfil+fecha (rachas, estadísticas por periodo) que no filtran por
-- habit_key. Este índice cubre esas consultas.
create index if not exists habit_logs_profile_date_idx on habit_logs (profile_id, date) include (completed);

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
  hecho_date date,
  asignado_a uuid references profiles(id),
  categoria text
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

-- ============ RECETAS ============

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  nombre text not null,
  ingredientes text not null default '',
  instrucciones text not null default '',
  favorita boolean not null default false,
  probada boolean not null default false,
  status text not null default 'active' check (status in ('active', 'suggested', 'declined')),
  imagen_url text,
  video_url text
);

alter table recipes enable row level security;

create policy recipes_select_own_or_shared on recipes for select
  using (owner_id = auth.uid() or visibility = 'shared');
create policy recipes_insert_own on recipes for insert with check (owner_id = auth.uid());
create policy recipes_update_own on recipes for update using (owner_id = auth.uid());
create policy recipes_delete_own on recipes for delete using (owner_id = auth.uid());

-- ============ VIDEOTECA ============

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  titulo text not null,
  video_url text not null,
  created_at timestamptz not null default now()
);

alter table videos enable row level security;

drop policy if exists videos_select_own_or_shared on videos;
create policy videos_select_own_or_shared on videos for select
  using (owner_id = auth.uid() or visibility = 'shared');
drop policy if exists videos_insert_own on videos;
create policy videos_insert_own on videos for insert with check (owner_id = auth.uid());
drop policy if exists videos_update_own on videos;
create policy videos_update_own on videos for update using (owner_id = auth.uid());
drop policy if exists videos_delete_own on videos;
create policy videos_delete_own on videos for delete using (owner_id = auth.uid());

-- ============ EVENTOS ============

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  visibility text not null default 'shared' check (visibility in ('private', 'shared')),
  titulo text not null,
  url text,
  lugar text,
  fecha_inicio date not null,
  fecha_fin date,
  imagen_url text,
  asistimos boolean not null default false,
  created_at timestamptz not null default now()
);

-- Por si la tabla 'events' ya existía de una ejecución anterior sin estas columnas.
alter table events add column if not exists imagen_url text;
alter table events add column if not exists asistimos boolean not null default false;

alter table events enable row level security;

drop policy if exists events_select_own_or_shared on events;
create policy events_select_own_or_shared on events for select
  using (owner_id = auth.uid() or visibility = 'shared');
drop policy if exists events_insert_own on events;
create policy events_insert_own on events for insert with check (owner_id = auth.uid());
drop policy if exists events_update_own on events;
create policy events_update_own on events for update using (owner_id = auth.uid());
drop policy if exists events_delete_own on events;
create policy events_delete_own on events for delete using (owner_id = auth.uid());

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
  ('skincare_ritual', 'Ritual coreano', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_batido_manana', 'Batido Herbalife (chocolate)', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_proteina_manana', 'Proteína', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_te_manana', 'Té', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_batido_noche', 'Batido Herbalife (chocolate)', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_proteina_noche', 'Proteína', 'salud', 'cuerpo', 'active', false, null),
  ('wc', 'WC (rutina digestiva matutina)', 'salud', 'cuerpo', 'suggested', false, null),
  ('dientes_mano_izquierda', 'Dientes con la mano izquierda', 'salud', 'cuerpo', 'suggested', false, null),
  ('vaso_limon', 'Vaso de limón', 'salud', 'cuerpo', 'suggested', false, null),
  ('desayunar', 'Desayunar con consciencia', 'salud', 'cuerpo', 'suggested', false, null),
  ('energia_tony_robbins', 'Subir la energía (Tony Robbins)', 'salud', 'alma', 'suggested', false, null),
  ('estudiar_desarrollo', 'Estudiar desarrollo personal', 'salud', 'mente', 'suggested', false, null)
on conflict (key) do nothing;

-- ============ MIGRACIÓN: ritual de bienestar simplificado + skincare en un solo paso ============
-- Si ya habías ejecutado este script antes, pega y ejecuta solo este bloque en el
-- SQL Editor de Supabase para actualizar tu base de datos existente: quita los
-- pasos de skincare por producto y del ritual de bienestar los que ya no se usan
-- (aloe, microbiota, fitocomplejo, modo nocturno), y da de alta los nuevos.

delete from habits where key in (
  'skincare_limpieza',
  'skincare_tonico',
  'skincare_serum',
  'skincare_hidratante',
  'skincare_spf',
  'bienestar_aloe_manana',
  'bienestar_microbiota_manana',
  'bienestar_phyto_manana',
  'bienestar_modo_nocturno',
  'bienestar_phyto_noche'
);

insert into habits (key, label, area, dimension, status, multi_check, meta_diaria) values
  ('skincare_ritual', 'Ritual coreano', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_batido_manana', 'Batido Herbalife (chocolate)', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_proteina_manana', 'Proteína', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_te_manana', 'Té', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_batido_noche', 'Batido Herbalife (chocolate)', 'salud', 'cuerpo', 'active', false, null),
  ('bienestar_proteina_noche', 'Proteína', 'salud', 'cuerpo', 'active', false, null)
on conflict (key) do nothing;

-- Si ya habías ejecutado el bloque de arriba con el nombre mal escrito ("Advertva
-- Light"), esto corrige el label a "Herbalife" sin tocar el resto de la fila.
update habits set label = 'Batido Herbalife (chocolate)'
where key in ('bienestar_batido_manana', 'bienestar_batido_noche')
  and label <> 'Batido Herbalife (chocolate)';

-- ============ MIGRACIÓN: rituales editables ============
-- Asigna ritual_key/ritual_group/sort_order/icon/time_label a los pasos de
-- ritual que ya existen, para que los rituales pasen a componerse desde estos
-- datos (editables desde la app) en vez de código fijo. Seguro de re-ejecutar.

update habits set ritual_key = 'manana', sort_order = 1, icon = '💧', time_label = '5:00–5:05' where key = 'manana_despertar_agua';
update habits set ritual_key = 'manana', sort_order = 2, icon = '🚿', time_label = '5:05–5:20' where key = 'manana_bano';
update habits set ritual_key = 'manana', sort_order = 3, icon = '🙏', time_label = '5:20–5:35' where key = 'manana_agradecer_meditar';
update habits set ritual_key = 'manana', sort_order = 4, icon = '✍️', time_label = '5:35–5:50' where key = 'manana_journal_objetivo';
update habits set ritual_key = 'manana', sort_order = 5, icon = '📖', time_label = '5:50–6:20' where key = 'manana_lectura';

update habits set ritual_key = 'noche', sort_order = 1, icon = '🧴', time_label = '19:30–19:45' where key = 'noche_ducha';
update habits set ritual_key = 'noche', sort_order = 2, icon = '📓', time_label = '19:45–20:00' where key = 'noche_revision_dia';
update habits set ritual_key = 'noche', sort_order = 3, icon = '💡', time_label = '20:00–20:10' where key = 'noche_aprendizajes';
update habits set ritual_key = 'noche', sort_order = 4, icon = '🎯', time_label = '20:10–20:20' where key = 'noche_planear_manana';
update habits set ritual_key = 'noche', sort_order = 5, icon = '📖', time_label = '20:20–20:45' where key = 'noche_lectura';

update habits set ritual_key = 'bienestar', ritual_group = 'manana', sort_order = 1, icon = '🥤', time_label = '7:00' where key = 'bienestar_batido_manana';
update habits set ritual_key = 'bienestar', ritual_group = 'manana', sort_order = 2, icon = '💪', time_label = '7:00' where key = 'bienestar_proteina_manana';
update habits set ritual_key = 'bienestar', ritual_group = 'manana', sort_order = 3, icon = '🍵', time_label = '7:00' where key = 'bienestar_te_manana';
update habits set ritual_key = 'bienestar', ritual_group = 'noche', sort_order = 4, icon = '🥤', time_label = '18:30' where key = 'bienestar_batido_noche';
update habits set ritual_key = 'bienestar', ritual_group = 'noche', sort_order = 5, icon = '💪', time_label = '18:30' where key = 'bienestar_proteina_noche';

update habits set ritual_key = 'skincare', sort_order = 1, icon = '🧴' where key = 'skincare_ritual';
