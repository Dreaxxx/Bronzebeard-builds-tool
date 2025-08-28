create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

create table if not exists public.builds (
  id uuid primary key,
  owner uuid references public.profiles(id) on delete cascade,
  title text not null,
  realm text not null,
  role text not null,
  class_tag text,
  tier_order jsonb not null default '[]',
  is_public boolean not null default true,
  comments_enabled boolean not null default false,
  description text,
  likes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint description_len check (description is null or char_length(description) <= 3000)
);
alter table public.builds enable row level security;
create policy "builds readable public or owner" on public.builds for select using (is_public or owner = auth.uid());
create policy "builds insert owner" on public.builds for insert with check (owner = auth.uid());
create policy "builds update owner" on public.builds for update using (owner = auth.uid());
create policy "builds delete owner" on public.builds for delete using (owner = auth.uid());

create table if not exists public.build_items (
  id uuid primary key,
  build_id uuid references public.builds(id) on delete cascade,
  tier text not null,
  slot text not null,
  rank int not null default 1,
  name text not null,
  stats jsonb not null default '{}',
  source text,
  notes text,
  href text
);
alter table public.build_items enable row level security;
create policy "items readable via build" on public.build_items for select using (exists (select 1 from public.builds b where b.id = build_id and (b.is_public or b.owner = auth.uid())));
create policy "items insert owner" on public.build_items for insert with check (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));
create policy "items update owner" on public.build_items for update using (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));
create policy "items delete owner" on public.build_items for delete using (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));

create table if not exists public.build_enchants (
  id uuid primary key,
  build_id uuid references public.builds(id) on delete cascade,
  name text not null,
  rarity text not null,
  slot text not null,
  cost int,
  notes text,
  href text
);
alter table public.build_enchants enable row level security;
create policy "enchants readable via build" on public.build_enchants for select using (exists (select 1 from public.builds b where b.id = build_id and (b.is_public or b.owner = auth.uid())));
create policy "enchants insert owner" on public.build_enchants for insert with check (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));
create policy "enchants update owner" on public.build_enchants for update using (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));
create policy "enchants delete owner" on public.build_enchants for delete using (exists (select 1 from public.builds b where b.id = build_id and b.owner = auth.uid()));
