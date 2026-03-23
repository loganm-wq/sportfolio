-- ============================================================
-- Sportfolio — Initial Schema
-- ============================================================

-- ---------- users_profiles ----------
create table public.users_profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null,
  full_name  text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users_profiles enable row level security;

create policy "Users can view own profile"
  on public.users_profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.users_profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.users_profiles for update
  using (id = auth.uid());

create policy "Users can delete own profile"
  on public.users_profiles for delete
  using (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- sports ----------
create table public.sports (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users_profiles(id) on delete cascade,
  name       text        not null,
  sport_type text        not null check (sport_type in (
    'running', 'cycling', 'triathlon', 'golf', 'pickleball',
    'bjj', 'crossfit', 'swimming', 'volleyball', 'basketball', 'other'
  )),
  is_active  boolean     default true,
  created_at timestamptz default now()
);

alter table public.sports enable row level security;

create policy "Users can view own sports"
  on public.sports for select
  using (user_id = auth.uid());

create policy "Users can insert own sports"
  on public.sports for insert
  with check (user_id = auth.uid());

create policy "Users can update own sports"
  on public.sports for update
  using (user_id = auth.uid());

create policy "Users can delete own sports"
  on public.sports for delete
  using (user_id = auth.uid());

-- ---------- events ----------
create table public.events (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users_profiles(id) on delete cascade,
  sport_id   uuid        not null references public.sports(id) on delete cascade,
  name       text        not null,
  event_date date,
  location   text,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Users can view own events"
  on public.events for select
  using (user_id = auth.uid());

create policy "Users can insert own events"
  on public.events for insert
  with check (user_id = auth.uid());

create policy "Users can update own events"
  on public.events for update
  using (user_id = auth.uid());

create policy "Users can delete own events"
  on public.events for delete
  using (user_id = auth.uid());

-- ---------- expenses ----------
create table public.expenses (
  id           uuid          primary key default gen_random_uuid(),
  user_id      uuid          not null references public.users_profiles(id) on delete cascade,
  sport_id     uuid          not null references public.sports(id) on delete cascade,
  event_id     uuid          references public.events(id) on delete set null,
  amount       numeric(10,2) not null,
  category     text          not null check (category in (
    'entry_fee', 'travel', 'lodging', 'gear', 'training', 'nutrition', 'other'
  )),
  description  text,
  expense_date date          not null default current_date,
  created_at   timestamptz   default now()
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (user_id = auth.uid());

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (user_id = auth.uid());

create policy "Users can update own expenses"
  on public.expenses for update
  using (user_id = auth.uid());

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (user_id = auth.uid());

-- ---------- indexes ----------
create index idx_expenses_user_id      on public.expenses(user_id);
create index idx_expenses_sport_id     on public.expenses(sport_id);
create index idx_expenses_event_id     on public.expenses(event_id);
create index idx_expenses_expense_date on public.expenses(expense_date);
