create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  job_id      uuid references public.jobs(id) on delete cascade,
  crew_id     uuid not null references public.crews(id) on delete cascade,
  completed   boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.tasks enable row level security;

-- Owner sees all tasks
create policy "tasks_owner_all" on public.tasks
  for all using (public.my_role() = 'owner');

-- Crew leader sees tasks assigned to their crew
create policy "tasks_crew_leader_select" on public.tasks
  for select using (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader');

-- Crew leader can mark tasks complete (update only completed/completed_at/completed_by)
create policy "tasks_crew_leader_update" on public.tasks
  for update using (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader')
  with check (crew_id = public.my_crew_id() and public.my_role() = 'crew_leader');
