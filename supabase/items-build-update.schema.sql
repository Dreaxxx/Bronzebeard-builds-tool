alter table public.build_items
  add column item_id integer null;

alter table public.build_items
  add constraint build_items_item_id_fkey
  foreign key (item_id)
  references public.items (id)
  on delete set null;

create index build_items_item_id_idx
  on public.build_items (item_id);