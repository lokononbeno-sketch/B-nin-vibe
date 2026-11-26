-- Add Benin-specific categories and remove the remaining events/participants RLS cycle.
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check check (
  category = any (array[
    'concert','anniversaire','piquenique','gala','miss','chill','sortie',
    'festival','soiree','conference','formation','atelier','foire',
    'ceremonie','sport','cinema','humour','networking','solidarite',
    'religieux','campus','gastronomie','mode','excursion','lancement',
    'traditionnel','vodun','bapteme','dot','funerailles','reveillon',
    'marche','caravane','autres'
  ]::text[])
);

create or replace function private.is_event_organizer(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and exists (
       select 1 from public.events e
       where e.id = p_event_id and e.organizer_id = auth.uid()
     );
$$;
revoke all on function private.is_event_organizer(uuid) from public;
grant execute on function private.is_event_organizer(uuid) to authenticated;

drop policy if exists "Participants visible to self and organizer" on public.event_participants;
create policy "Participants visible to self and organizer"
on public.event_participants for select to authenticated
using (user_id = (select auth.uid()) or private.is_event_organizer(event_id));

drop policy if exists "Organizers confirm event payments" on public.event_participants;
create policy "Organizers confirm event payments"
on public.event_participants for update to authenticated
using (private.is_event_organizer(event_id) or public.is_platform_admin())
with check (private.is_event_organizer(event_id) or public.is_platform_admin());
