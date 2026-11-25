grant execute on function public.is_platform_admin() to anon, authenticated;

create or replace function public.reserve_event_tickets(p_event_id uuid,p_quantity integer)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_capacity integer; v_reserved integer;
begin
 if auth.uid() is null then raise exception 'Connecte-toi pour réserver.'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>10 then raise exception 'Choisis entre 1 et 10 tickets.'; end if;
 select capacity into v_capacity from public.events where id=p_event_id and status='published' for update;
 if not found then raise exception 'Événement indisponible.'; end if;
 select coalesce(sum(ticket_quantity),0) into v_reserved from public.event_participants where event_id=p_event_id and status='going';
 if v_reserved+p_quantity>v_capacity then raise exception 'Il ne reste pas assez de places pour cette réservation.'; end if;
 insert into public.event_participants(event_id,user_id,status,ticket_quantity,payment_status)
 values(p_event_id,auth.uid(),'going',p_quantity,'pending')
 on conflict(event_id,user_id) do update set ticket_quantity=excluded.ticket_quantity,status='going',payment_status='pending'
 where public.event_participants.payment_status<>'paid';
 if not found then raise exception 'Un paiement déjà confirmé ne peut pas être remplacé par une nouvelle réservation.'; end if;
end; $$;
revoke all on function public.reserve_event_tickets(uuid,integer) from public;
grant execute on function public.reserve_event_tickets(uuid,integer) to authenticated;

create or replace function public.cancel_event_reservation(p_event_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_count integer;
begin
 if auth.uid() is null then raise exception 'Connecte-toi pour gérer tes réservations.'; end if;
 delete from public.event_participants where event_id=p_event_id and user_id=auth.uid() and payment_status<>'paid';
 get diagnostics v_count=row_count;
 if v_count=0 then raise exception 'Réservation introuvable ou paiement déjà confirmé. Contacte l’organisateur.'; end if;
end; $$;
revoke all on function public.cancel_event_reservation(uuid) from public;
grant execute on function public.cancel_event_reservation(uuid) to authenticated;

create or replace function public.prevent_paid_ticket_changes()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_owner uuid;
begin
 select organizer_id into v_owner from public.events where id=old.event_id;
 if old.payment_status='paid' and auth.uid() is distinct from v_owner and not public.is_platform_admin() then
   raise exception 'Un ticket payé et confirmé ne peut pas être modifié ou supprimé par le participant.';
 end if;
 return coalesce(new,old);
end; $$;
drop trigger if exists prevent_paid_ticket_changes on public.event_participants;
create trigger prevent_paid_ticket_changes before update or delete on public.event_participants
for each row execute function public.prevent_paid_ticket_changes();
