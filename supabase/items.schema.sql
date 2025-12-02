create table public.items (
  id           bigint primary key,
  name         text,
  slot         text,
  "inventoryType" int,
  "classID"    int,
  "subClassID" int,
  "subClass"   text,
  "itemClass"  text,
  "itemSubClass" text,
  quality      int,
  "qualityText" text,
  difficulty   text,
  ilvl         int,
  "reqLevel"   int,
  icon         text,
  "sellPrice"  bigint,
  stats        jsonb
);

create index items_quality_idx on public.items (quality);
create index items_slot_idx  on public.items (slot);
create index items_classID_idx  on public.items (classID);
