-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('owner','crew_leader')),
  crew_id     uuid,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- ─── Crews ────────────────────────────────────────────────────────────────────
create table if not exists public.crews (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  members       integer not null default 0,
  rate_per_sqft numeric(6,2) not null default 0,
  owner_id      uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now()
);

-- ─── Jobs ─────────────────────────────────────────────────────────────────────
create table if not exists public.jobs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  client      text,
  address     text,
  sqft        numeric(10,2) not null default 0,
  job_rate    numeric(6,2) not null default 0,
  stage       text not null default 'Quoted'
              check (stage in ('Quoted','Scheduled','Framing','Hanging','Taping','Finishing','Inspection','Complete')),
  crew_id     uuid references public.crews(id) on delete set null,
  notes       text,
  owner_id    uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Job Sheets ───────────────────────────────────────────────────────────────
create table if not exists public.job_sheets (
  id      uuid primary key default uuid_generate_v4(),
  job_id  uuid not null references public.jobs(id) on delete cascade,
  size    text not null,
  qty     integer not null default 0
);

-- ─── Job Photos ───────────────────────────────────────────────────────────────
create table if not exists public.job_photos (
  id            uuid primary key default uuid_generate_v4(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  url           text not null,
  storage_path  text not null,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now()
);

-- ─── Job Activity ─────────────────────────────────────────────────────────────
create table if not exists public.job_activity (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid not null references public.jobs(id) on delete cascade,
  message     text not null,
  actor_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─── Foreign key: profiles.crew_id → crews ───────────────────────────────────
alter table public.profiles
  add constraint fk_profiles_crew
  foreign key (crew_id) references public.crews(id) on delete set null;

-- ─── Auto-create profile on signup ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role, crew_id, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'crew_leader'),
    (new.raw_user_meta_data->>'crew_id')::uuid,
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        role  = excluded.role,
        crew_id = coalesce(excluded.crew_id, profiles.crew_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- ─── Enable RLS ───────────────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.crews       enable row level security;
alter table public.jobs        enable row level security;
alter table public.job_sheets  enable row level security;
alter table public.job_photos  enable row level security;
alter table public.job_activity enable row level security;

-- ─── Helper: get current user's role ─────────────────────────────────────────
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.my_crew_id()
returns uuid language sql security definer stable as $$
  select crew_id from public.profiles where id = auth.uid();
$$;

-- ─── RLS: profiles ───────────────────────────────────────────────────────────
create policy "profiles_owner_all" on public.profiles
  for all using (public.my_role() = 'owner');

create policy "profiles_own_row" on public.profiles
  for select using (id = auth.uid());

-- ─── RLS: crews ──────────────────────────────────────────────────────────────
create policy "crews_owner_all" on public.crews
  for all using (public.my_role() = 'owner');

create policy "crews_crew_leader_own" on public.crews
  for select using (id = public.my_crew_id() and public.my_role() = 'crew_leader');

-- ─── RLS: jobs ───────────────────────────────────────────────────────────────
create policy "jobs_owner_all" on public.jobs
  for all using (public.my_role() = 'owner');

create policy "jobs_crew_leader_select" on public.jobs
  for select using (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader');

create policy "jobs_crew_leader_update_stage" on public.jobs
  for update using (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader')
  with check (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader');

-- ─── RLS: job_sheets ─────────────────────────────────────────────────────────
create policy "sheets_owner_all" on public.job_sheets
  for all using (public.my_role() = 'owner');

create policy "sheets_crew_leader_select" on public.job_sheets
  for select using (
    job_id in (select id from public.jobs where crew_id = public.my_crew_id())
    and public.my_role() = 'crew_leader'
  );

-- ─── RLS: job_photos ─────────────────────────────────────────────────────────
create policy "photos_owner_all" on public.job_photos
  for all using (public.my_role() = 'owner');

create policy "photos_crew_leader_select" on public.job_photos
  for select using (
    job_id in (select id from public.jobs where crew_id = public.my_crew_id())
    and public.my_role() = 'crew_leader'
  );

create policy "photos_crew_leader_insert" on public.job_photos
  for insert with check (
    job_id in (select id from public.jobs where crew_id = public.my_crew_id())
    and public.my_role() = 'crew_leader'
  );

-- ─── RLS: job_activity ───────────────────────────────────────────────────────
create policy "activity_owner_all" on public.job_activity
  for all using (public.my_role() = 'owner');

create policy "activity_crew_leader_select" on public.job_activity
  for select using (
    job_id in (select id from public.jobs where crew_id = public.my_crew_id())
    and public.my_role() = 'crew_leader'
  );

create policy "activity_crew_leader_insert" on public.job_activity
  for insert with check (
    job_id in (select id from public.jobs where crew_id = public.my_crew_id())
    and public.my_role() = 'crew_leader'
  );

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New Bucket
-- Name: job-photos, Public: true
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

create policy "photos_upload" on storage.objects
  for insert with check (bucket_id = 'job-photos' and auth.role() = 'authenticated');

create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'job-photos');

create policy "photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'job-photos' and auth.role() = 'authenticated');
