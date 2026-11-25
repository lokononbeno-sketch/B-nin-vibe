drop policy if exists "Users register themselves" on public.event_participants;
drop policy if exists "Users update own registration" on public.event_participants;

create or replace function public.prevent_paid_ticket_changes()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if old.payment_status='paid' and not public.is_platform_admin() then
   raise exception 'Un ticket payé et confirmé est verrouillé. Contacte Bénin Vibe en cas de correction.';
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end; $$;
revoke all on function public.prevent_paid_ticket_changes() from anon,authenticated,public;
