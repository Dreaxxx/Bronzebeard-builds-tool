update public.build_items bi
set item_id = it.id
from public.items it
where bi.item_id is null
  and bi.name = it.name
  
-- Plus tard :
-- alter table public.build_items
--   alter column item_id set not null;

-- alter table public.build_items drop column name;
