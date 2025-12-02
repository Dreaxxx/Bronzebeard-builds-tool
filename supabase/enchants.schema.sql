create table public.mystic_enchants (
  id integer primary key, 
  name text not null,     
  description text null,
  rarity text not null check (
    rarity in ('Rare', 'Epic', 'Legendary', 'Artifact')
  ),
  class text null,        
  level integer null      
);

create index mystic_enchants_rarity_idx on public.mystic_enchants (rarity);
create index mystic_enchants_class_idx  on public.mystic_enchants (class);
create index mystic_enchants_level_idx  on public.mystic_enchants (level);