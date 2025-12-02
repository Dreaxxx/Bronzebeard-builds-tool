update public.build_enchants be
set enchant_id = me.id
from public.mystic_enchants me
where be.enchant_id is null
  and be.name = me.name
  and be.rarity = me.rarity;
  
-- Plus tard :
-- alter table public.build_enchants
--   alter column enchant_id set not null;

-- alter table public.build_enchants drop column name;
-- alter table public.build_enchants drop column rarity;