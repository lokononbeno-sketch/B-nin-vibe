create or replace function public.guard_participant_payment_confirmation()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_owner uuid;
begin
 if new.payment_status is distinct from old.payment_status
    or new.payment_confirmed_at is distinct from old.payment_confirmed_at
    or new.payment_confirmed_by is distinct from old.payment_confirmed_by then
  select organizer_id into v_owner from public.events where id=old.event_id;
  if auth.uid() is distinct from v_owner and not public.is_platform_admin() then
   raise exception 'Seul l’organisateur peut confirmer le paiement.';
  end if;
  if new.payment_status='paid' then
   new.payment_confirmed_at:=coalesce(new.payment_confirmed_at,now());
   new.payment_confirmed_by:=coalesce(new.payment_confirmed_by,auth.uid());
   new.status:='going';
  else
   new.payment_confirmed_at:=null;
   new.payment_confirmed_by:=null;
   if new.payment_status='rejected' then new.status:='cancelled'; end if;
  end if;
 end if;
 return new;
end; $$;
revoke all on function public.guard_participant_payment_confirmation() from anon,authenticated,public;
