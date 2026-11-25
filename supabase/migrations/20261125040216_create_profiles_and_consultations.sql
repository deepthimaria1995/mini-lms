-- 1. Create profiles table

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role text not null default 'student'
    check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Create consultations table

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null
    references public.profiles(id) on delete cascade,
  reason text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Add indexes for common queries

create index consultations_student_id_idx
  on public.consultations(student_id);

create index consultations_scheduled_at_idx
  on public.consultations(scheduled_at);

create index consultations_status_idx
  on public.consultations(status);

  -- Create a profile automatically when a user signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    'student'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles
enable row level security;

alter table public.consultations
enable row level security;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select public.current_user_is_admin())
);

create policy "Students view own consultations and admins view all"
on public.consultations
for select
to authenticated
using (
  student_id = (select auth.uid())
  or (select public.current_user_is_admin())
);

create policy "Students can create own consultations"
on public.consultations
for insert
to authenticated
with check (
  student_id = (select auth.uid())
);

create policy "Students update own consultations"
on public.consultations
for update
to authenticated
using (
  student_id = (select auth.uid())
)
with check (
  student_id = (select auth.uid())
);

create policy "Students delete own consultations"
on public.consultations
for delete
to authenticated
using (
  student_id = (select auth.uid())
);