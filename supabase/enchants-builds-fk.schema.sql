alter table public.build_enchants
  add column enchant_id integer null;

alter table public.build_enchants
  add constraint build_enchants_enchant_id_fkey
  foreign key (enchant_id)
  references public.mystic_enchants (id)
  on delete set null;

create index build_enchants_enchant_id_idx
  on public.build_enchants (enchant_id);