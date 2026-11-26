-- Fix the events <-> event_participants RLS cycle without disabling row security.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_event_participant(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.event_participants ep
       where ep.event_id = p_event_id
         and ep.user_id = auth.uid()
     );
$$;

revoke all on function private.is_event_participant(uuid) from public;
grant execute on function private.is_event_participant(uuid) to anon, authenticated;

drop policy if exists "Public reads published events" on public.events;
create policy "Public reads published events"
on public.events
for select
to anon, authenticated
using (
  (status = 'published' and visibility = 'public')
  or organizer_id = (select auth.uid())
  or private.is_event_participant(id)
);

-- Grant the previously designated platform administrator their admin row.
insert into public.platform_admins (user_id)
select id
from auth.users
where lower(email) = lower('benolokonon@gmail.com')
on conflict (user_id) do nothing;
