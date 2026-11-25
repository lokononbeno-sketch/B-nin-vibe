create or replace function public.guard_organizer_ticket_fields()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_owner uuid;
begin
 select organizer_id into v_owner from public.events where id=old.event_id;
 if auth.uid()=v_owner and not public.is_platform_admin()
    and (new.event_id is distinct from old.event_id
      or new.user_id is distinct from old.user_id
      or new.ticket_quantity is distinct from old.ticket_quantity
      or new.status is distinct from old.status) then
   raise exception 'L’organisateur peut confirmer le paiement, mais ne peut pas modifier les détails de la réservation.';
 end if;
 return new;
end; $$;
drop trigger if exists guard_organizer_ticket_fields on public.event_participants;
create trigger guard_organizer_ticket_fields before update on public.event_participants
for each row execute function public.guard_organizer_ticket_fields();
revoke all on function public.guard_organizer_ticket_fields() from anon,authenticated,public;
