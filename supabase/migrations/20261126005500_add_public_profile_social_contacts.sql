alter table public.profiles
  add column if not exists facebook_url text,
  add column if not exists whatsapp_numbers text[] not null default '{}'::text[];

alter table public.profiles
  add constraint profiles_facebook_url_check
  check (facebook_url is null or facebook_url ~* '^https?://(www\\.)?facebook\\.com/');

alter table public.profiles
  add constraint profiles_whatsapp_numbers_check
  check (cardinality(whatsapp_numbers) <= 3);

update public.profiles p
set whatsapp_numbers = case
  when coalesce(array_length(p.whatsapp_numbers, 1), 0) = 0
       and nullif(trim(up.whatsapp_phone), '') is not null
  then array[trim(up.whatsapp_phone)]
  else p.whatsapp_numbers
end
from public.user_preferences up
where up.user_id = p.id;
