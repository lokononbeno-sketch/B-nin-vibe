create or replace function public.guard_commission_snapshot()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.commission_per_ticket is distinct from old.commission_per_ticket
    and not public.is_platform_admin()
    and current_setting('app.reservation_rpc',true) is distinct from 'on' then
   raise exception 'Le taux de commission d’une réservation ne peut pas être modifié manuellement.';
 end if;
 return new;
end; $$;
drop trigger if exists guard_commission_snapshot on public.event_participants;
create trigger guard_commission_snapshot before update on public.event_participants
for each row execute function public.guard_commission_snapshot();
revoke all on function public.guard_commission_snapshot() from anon,authenticated,public;

create or replace function public.reserve_event_tickets(p_event_id uuid,p_quantity integer)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_capacity integer; v_reserved integer; v_commission numeric(12,2);
begin
 if auth.uid() is null then raise exception 'Connecte-toi pour réserver.'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>10 then raise exception 'Choisis entre 1 et 10 tickets.'; end if;
 select capacity,commission_per_ticket into v_capacity,v_commission
 from public.events where id=p_event_id and status='published' for update;
 if not found then raise exception 'Événement indisponible.'; end if;
 select coalesce(sum(ticket_quantity),0) into v_reserved
 from public.event_participants where event_id=p_event_id and status='going';
 if v_reserved+p_quantity>v_capacity then raise exception 'Il ne reste pas assez de places pour cette réservation.'; end if;
 perform set_config('app.reservation_rpc','on',true);
 insert into public.event_participants(event_id,user_id,status,ticket_quantity,payment_status,commission_per_ticket)
 values(p_event_id,auth.uid(),'going',p_quantity,'pending',coalesce(v_commission,0))
 on conflict(event_id,user_id) do update
 set ticket_quantity=excluded.ticket_quantity,status='going',payment_status='pending',
     commission_per_ticket=excluded.commission_per_ticket
 where public.event_participants.payment_status<>'paid';
 if not found then raise exception 'Un paiement déjà confirmé ne peut pas être remplacé par une nouvelle réservation.'; end if;
end; $$;
revoke all on function public.reserve_event_tickets(uuid,integer) from anon,public;
grant execute on function public.reserve_event_tickets(uuid,integer) to authenticated;
