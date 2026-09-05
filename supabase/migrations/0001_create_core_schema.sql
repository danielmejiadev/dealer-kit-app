-- Fase 1: esquema core (dealers, dealer_members, vehicles, vehicle_photos)
-- + storage bucket vehicle-photos + RLS. Ver AGENTS.md y el plan de la
-- Fase 1 (catálogo público + panel admin) para el razonamiento completo.
--
-- Aplicado y verificado manualmente vía MCP execute_sql antes de generar
-- este archivo (ver "Secuencia de construcción" del plan): RLS probada
-- como rol anon (0 vehicles visibles en draft, 1 tras publicar), y
-- get_advisors (security) limpio.

-- ---------------------------------------------------------------------------
-- Schema no expuesto para funciones helper de RLS (security definer).
-- No aparece en api.schemas (config.toml), así que no es alcanzable via
-- Data API sin importar los GRANTs.
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger compartido para updated_at
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- dealers
-- ---------------------------------------------------------------------------
create table public.dealers (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  theme jsonb not null default
    '{"accentColorHex":"#b8842e","headingFont":"inter","bodyFont":"inter"}'::jsonb,
  contact_phone text,
  contact_email text,
  contact_whatsapp text,
  city text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealers_theme_shape check (
    theme ? 'accentColorHex'
    and theme->>'accentColorHex' ~ '^#[0-9a-fA-F]{6}$'
    and theme->>'headingFont' in ('inter','ibm-plex-sans','sora','fraunces')
    and theme->>'bodyFont' in ('inter','ibm-plex-sans','sora')
  )
);

comment on table public.dealers is 'Una fila por compraventa. En Fase 1 solo existe una (slug=''default'').';

create trigger dealers_set_updated_at
before update on public.dealers
for each row execute function private.set_updated_at();

alter table public.dealers enable row level security;

create policy "dealers_select_public"
on public.dealers
for select
to anon, authenticated
using (true);

-- Solo UPDATE para miembros del dealer (sin INSERT/DELETE policy: crear o
-- borrar un dealer no es una operación de esta fase).
create policy "dealers_update_members"
on public.dealers
for update
to authenticated
using (private.is_dealer_member(id))
with check (private.is_dealer_member(id));

-- ---------------------------------------------------------------------------
-- dealer_members (join tenant <-> auth.users)
-- ---------------------------------------------------------------------------
create table public.dealer_members (
  id bigint generated always as identity primary key,
  dealer_id bigint not null references public.dealers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  unique (dealer_id, user_id)
);

-- Covering index for the auth.users FK (flagged by the performance advisor
-- otherwise).
create index dealer_members_user_id_idx on public.dealer_members (user_id);

alter table public.dealer_members enable row level security;

create policy "dealer_members_select_own"
on public.dealer_members
for select
to authenticated
using (user_id = (select auth.uid()));

-- No hay policy de escritura: el primer owner de cada dealer se vincula a
-- mano vía execute_sql (rol postgres) después de su primer login por magic
-- link. Ver la descripción del PR para el estado de este paso manual.

-- ---------------------------------------------------------------------------
-- Funciones helper de autorización (security definer, schema no expuesto).
-- is_dealer_member se declara antes de "vehicles" (dealers.dealers_update_members
-- la usa); is_vehicle_dealer_member se declara después de "vehicles" porque
-- hace join contra esa tabla.
-- ---------------------------------------------------------------------------
create function private.is_dealer_member(target_dealer_id bigint)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.dealer_members
    where dealer_id = target_dealer_id
      and user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_dealer_member(bigint) from public;
grant execute on function private.is_dealer_member(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id bigint generated always as identity primary key,
  dealer_id bigint not null references public.dealers(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'sold', 'archived')),
  placa text not null
    check (placa ~ '^[A-Z]{3}[0-9]{3}$' or placa ~ '^[A-Z]{3}[0-9]{2}[A-Z]$'),
  marca text not null,
  linea text not null,
  modelo smallint not null check (modelo between 1980 and 2100),
  color text not null,
  cilindraje integer check (cilindraje is null or cilindraje > 0),
  clase_vehiculo text not null
    check (clase_vehiculo in (
      'automovil', 'campero', 'camioneta', 'motocicleta', 'camion', 'buseta', 'otro'
    )),
  combustible text not null
    check (combustible in ('gasolina', 'diesel', 'gas', 'electrico', 'hibrido')),
  transmision text not null check (transmision in ('manual', 'automatica')),
  kilometraje integer not null check (kilometraje >= 0),
  precio_cop bigint not null check (precio_cop > 0),
  descripcion text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dealer_id, placa)
);

comment on column public.vehicles.cilindraje is 'Nullable: vehículos eléctricos no tienen cilindraje.';
comment on column public.vehicles.placa is 'Formato colombiano: AAA123 o AAA12A, siempre mayúsculas (la regex ya lo exige).';

-- Cubre la query del catálogo público (solo publicados, más recientes primero).
create index vehicles_published_catalog_idx
  on public.vehicles (dealer_id, published_at desc)
  where status = 'published';

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function private.set_updated_at();

alter table public.vehicles enable row level security;

-- Split by role, not merged into one "anon, authenticated" policy with an
-- OR: the member half calls private.is_dealer_member(), and a function's
-- EXECUTE grant is checked against every role a policy applies to even on
-- the short-circuited branch, so a single merged policy would raise
-- "permission denied for function is_dealer_member" for anon (which has no
-- EXECUTE grant on it, by design). Splitting also happens to keep exactly
-- one permissive SELECT policy per role, avoiding the "multiple permissive
-- policies" performance lint.
create policy "vehicles_select_published_anon"
on public.vehicles
for select
to anon
using (status = 'published');

create policy "vehicles_select_published_or_own_authenticated"
on public.vehicles
for select
to authenticated
using (status = 'published' or private.is_dealer_member(dealer_id));

create policy "vehicles_insert_members"
on public.vehicles
for insert
to authenticated
with check (private.is_dealer_member(dealer_id));

-- with check también en UPDATE: sin esto, un miembro podría reasignar
-- dealer_id de un vehículo hacia un dealer del que no es miembro.
create policy "vehicles_update_members"
on public.vehicles
for update
to authenticated
using (private.is_dealer_member(dealer_id))
with check (private.is_dealer_member(dealer_id));

create policy "vehicles_delete_members"
on public.vehicles
for delete
to authenticated
using (private.is_dealer_member(dealer_id));

create function private.is_vehicle_dealer_member(target_vehicle_id bigint)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.vehicles vehicle
    join public.dealer_members member on member.dealer_id = vehicle.dealer_id
    where vehicle.id = target_vehicle_id
      and member.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_vehicle_dealer_member(bigint) from public;
grant execute on function private.is_vehicle_dealer_member(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- vehicle_photos (tabla propia, no array — una fase futura de IA podrá
-- anotar por-foto sin romper el esquema)
-- ---------------------------------------------------------------------------
create table public.vehicle_photos (
  id bigint generated always as identity primary key,
  vehicle_id bigint not null references public.vehicles(id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index vehicle_photos_vehicle_position_idx
  on public.vehicle_photos (vehicle_id, position);

alter table public.vehicle_photos enable row level security;

-- Same split-by-role reasoning as vehicles_select_*: anon cannot execute
-- private.is_vehicle_dealer_member(), so it needs a policy of its own.
create policy "vehicle_photos_select_published_anon"
on public.vehicle_photos
for select
to anon
using (
  exists (
    select 1
    from public.vehicles vehicle
    where vehicle.id = vehicle_photos.vehicle_id
      and vehicle.status = 'published'
  )
);

create policy "vehicle_photos_select_published_or_own_authenticated"
on public.vehicle_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles vehicle
    where vehicle.id = vehicle_photos.vehicle_id
      and vehicle.status = 'published'
  )
  or private.is_vehicle_dealer_member(vehicle_id)
);

create policy "vehicle_photos_insert_members"
on public.vehicle_photos
for insert
to authenticated
with check (private.is_vehicle_dealer_member(vehicle_id));

create policy "vehicle_photos_update_members"
on public.vehicle_photos
for update
to authenticated
using (private.is_vehicle_dealer_member(vehicle_id))
with check (private.is_vehicle_dealer_member(vehicle_id));

create policy "vehicle_photos_delete_members"
on public.vehicle_photos
for delete
to authenticated
using (private.is_vehicle_dealer_member(vehicle_id));

-- ---------------------------------------------------------------------------
-- Storage: bucket vehicle-photos, público en lectura.
-- Convención de ruta: {dealer_id}/{vehicle_id}/{uuid}.{ext}
--
-- Un bucket "public" ya sirve descargas anónimas sin necesitar una policy
-- de SELECT en storage.objects (confirmado contra la doc de Storage Access
-- Control: "Setting a bucket to Public only allows unauthenticated
-- downloads"). Solo restringimos escritura a miembros del dealer dueño del
-- primer segmento de la ruta.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

create policy "vehicle_photos_bucket_insert_members"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vehicle-photos'
  and private.is_dealer_member(((storage.foldername(name))[1])::bigint)
);

create policy "vehicle_photos_bucket_update_members"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vehicle-photos'
  and private.is_dealer_member(((storage.foldername(name))[1])::bigint)
)
with check (
  bucket_id = 'vehicle-photos'
  and private.is_dealer_member(((storage.foldername(name))[1])::bigint)
);

create policy "vehicle_photos_bucket_delete_members"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vehicle-photos'
  and private.is_dealer_member(((storage.foldername(name))[1])::bigint)
);

-- ---------------------------------------------------------------------------
-- Seed: el único dealer de esta fase.
-- ---------------------------------------------------------------------------
insert into public.dealers (name, slug)
values ('Mi Compraventa', 'default')
on conflict (slug) do nothing;
