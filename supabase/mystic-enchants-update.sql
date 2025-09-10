-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- Enums (idempotent)
do $$ begin
  create type rarity_enum as enum ('Rare','Epic','Legendary','Artifact');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wow_class_enum as enum (
    'Warrior','Paladin','Hunter','Rogue','Priest','DeathKnight',
    'Shaman','Mage','Warlock','Druid','Any'
  );
exception when duplicate_object then null; end $$;

-- Table (sans colonne générée)
create table if not exists public.mystic_enchants (
  id            uuid primary key default gen_random_uuid(),
  ascension_id  integer unique not null,
  name          text not null,
  description   text,
  rarity        rarity_enum not null,
  class_tag     wow_class_enum not null,
  href          text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  search_vec    tsvector                             
);

comment on table  public.mystic_enchants is 'Manual catalog of Mystic Enchants for Ascension.';
comment on column public.mystic_enchants.ascension_id is 'Numeric id used by db.ascension.gg (if known).';

-- Triggers utilitaires
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists set_mystic_enchants_updated_at on public.mystic_enchants;
create trigger set_mystic_enchants_updated_at
before update on public.mystic_enchants
for each row execute function public.set_updated_at();

create or replace function public.set_created_by()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end$$;

drop trigger if exists set_mystic_enchants_created_by on public.mystic_enchants;
create trigger set_mystic_enchants_created_by
before insert on public.mystic_enchants
for each row execute function public.set_created_by();

-- Trigger qui maintient search_vec (avec unaccent)
create or replace function public.mystic_enchants_update_search_vec()
returns trigger language plpgsql as $$
begin
  new.search_vec :=
    to_tsvector(
      'simple',
      unaccent(coalesce(new.name,'')) || ' ' || unaccent(coalesce(new.description,''))
    );
  return new;
end$$;

drop trigger if exists trg_mystic_enchants_search_vec on public.mystic_enchants;
create trigger trg_mystic_enchants_search_vec
before insert or update on public.mystic_enchants
for each row execute function public.mystic_enchants_update_search_vec();

-- Indexes
create index if not exists mystic_enchants_search_idx on public.mystic_enchants using gin (search_vec);
create index if not exists mystic_enchants_name_trgm on public.mystic_enchants using gin (name gin_trgm_ops);
create index if not exists mystic_enchants_class_idx on public.mystic_enchants (class_tag);
create index if not exists mystic_enchants_rarity_idx on public.mystic_enchants (rarity);

-- RLS
alter table public.mystic_enchants enable row level security;

drop policy if exists "MysticEnchants read for all" on public.mystic_enchants;
create policy "MysticEnchants read for all"
on public.mystic_enchants
for select
to anon, authenticated
using (true);

drop policy if exists "MysticEnchants insert own" on public.mystic_enchants;
create policy "MysticEnchants insert own"
on public.mystic_enchants
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "MysticEnchants update own" on public.mystic_enchants;
create policy "MysticEnchants update own"
on public.mystic_enchants
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "MysticEnchants delete own" on public.mystic_enchants;
create policy "MysticEnchants delete own"
on public.mystic_enchants
for delete
to authenticated
using (created_by = auth.uid());
