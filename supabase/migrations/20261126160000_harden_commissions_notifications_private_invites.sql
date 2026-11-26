create extension if not exists pgcrypto;
alter table public.events add column if not exists invite_token uuid not null default gen_random_uuid();
create unique index if not exists events_invite_token_uidx on public.events(invite_token);
create table if not exists public.commission_obligations(id uuid primary key default gen_random_uuid(),participant_id uuid not null unique references public.event_participants(id) on delete cascade,organizer_id uuid not null references auth.users(id) on delete cascade,amount numeric(12,2) not null check(amount>=0),due_at timestamptz not null,created_at timestamptz not null default now());
create table if not exists public.commission_payment_allocations(id uuid primary key default gen_random_uuid(),payment_id uuid not null references public.commission_payments(id) on delete cascade,obligation_id uuid not null references public.commission_obligations(id),amount numeric(12,2) not null check(amount>0),created_at timestamptz not null default now(),unique(payment_id,obligation_id));
create index if not exists commission_obligations_organizer_due_idx on public.commission_obligations(organizer_id,due_at);
create index if not exists commission_allocations_obligation_idx on public.commission_payment_allocations(obligation_id);
alter table public.commission_obligations enable row level security;
alter table public.commission_payment_allocations enable row level security;
drop policy if exists "Organizers read own obligations" on public.commission_obligations;
create policy "Organizers read own obligations" on public.commission_obligations for select to authenticated using(organizer_id=(select auth.uid()) or public.is_platform_admin());
drop policy if exists "Admins read allocations" on public.commission_payment_allocations;
create policy "Admins read allocations" on public.commission_payment_allocations for select to authenticated using(public.is_platform_admin());
create or replace function private.capture_commission_obligation() returns trigger language plpgsql security definer set search_path='' as $$
declare v_organizer uuid; v_commission numeric;
begin
 if new.payment_status='paid' and (tg_op='INSERT' or old.payment_status is distinct from 'paid') then
  select e.organizer_id,coalesce(new.commission_per_ticket,e.commission_per_ticket,0) into v_organizer,v_commission from public.events e where e.id=new.event_id;
  insert into public.commission_obligations(participant_id,organizer_id,amount,due_at) values(new.id,v_organizer,v_commission*greatest(new.ticket_quantity,1),coalesce(new.payment_confirmed_at,now())+interval '48 hours') on conflict(participant_id) do nothing;
 end if; return new;
end $$;
drop trigger if exists capture_commission_obligation on public.event_participants;
create trigger capture_commission_obligation after insert or update of payment_status on public.event_participants for each row execute function private.capture_commission_obligation();
create or replace function private.organizer_has_overdue_commission() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.commission_obligations o where o.organizer_id=auth.uid() and o.due_at<now() and o.amount>coalesce((select sum(a.amount) from public.commission_payment_allocations a where a.obligation_id=o.id),0));
$$;
revoke all on function private.organizer_has_overdue_commission() from public;
grant execute on function private.organizer_has_overdue_commission() to authenticated;
create or replace function public.admin_record_commission_submission(p_submission_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare s public.commission_payment_submissions%rowtype; v_payment_id uuid; v_remaining numeric; o record; v_open numeric; v_alloc numeric;
begin
 if not public.is_platform_admin() then raise exception 'Accès administrateur requis'; end if;
 select * into s from public.commission_payment_submissions where id=p_submission_id for update;
 if not found or s.status<>'pending' then raise exception 'Déclaration déjà traitée ou introuvable'; end if;
 if exists(select 1 from public.commission_payments where reference=s.reference and organizer_id=s.organizer_id) then raise exception 'Cette référence de transfert a déjà été enregistrée'; end if;
 insert into public.commission_payments(organizer_id,amount,payment_method,reference,recorded_by) values(s.organizer_id,s.amount,s.payment_method,s.reference,auth.uid()) returning id into v_payment_id;
 v_remaining:=s.amount;
 for o in select id,amount from public.commission_obligations where organizer_id=s.organizer_id order by due_at,id for update loop
  exit when v_remaining<=0;
  select greatest(0,o.amount-coalesce(sum(a.amount),0)) into v_open from public.commission_payment_allocations a where a.obligation_id=o.id;
  if v_open>0 then v_alloc:=least(v_remaining,v_open);insert into public.commission_payment_allocations(payment_id,obligation_id,amount) values(v_payment_id,o.id,v_alloc);v_remaining:=v_remaining-v_alloc;end if;
 end loop;
 update public.commission_payment_submissions set status='verified',reviewed_at=now(),reviewed_by=auth.uid() where id=s.id;return v_payment_id;
end $$;
revoke all on function public.admin_record_commission_submission(uuid) from public,anon;
grant execute on function public.admin_record_commission_submission(uuid) to authenticated;
create or replace function private.notify_reservation_and_payment() returns trigger language plpgsql security definer set search_path='' as $$
declare v_owner uuid; v_title text;
begin
 select organizer_id,title into v_owner,v_title from public.events where id=new.event_id;
 if tg_op='INSERT' then
  insert into public.notifications(recipient_id,actor_id,type,title,body,data) values(v_owner,new.user_id,'reservation','Nouvelle réservation','Une réservation a été effectuée pour « '||v_title||' ».',jsonb_build_object('event_id',new.event_id,'participant_id',new.id));
 elsif new.payment_status='paid' and old.payment_status is distinct from 'paid' then
  insert into public.notifications(recipient_id,actor_id,type,title,body,data) values(new.user_id,v_owner,'payment_confirmed','Paiement confirmé','Le paiement de ta réservation pour « '||v_title||' » a été confirmé.',jsonb_build_object('event_id',new.event_id,'participant_id',new.id));
 end if;return new;
end $$;
drop trigger if exists notify_reservation_and_payment on public.event_participants;
create trigger notify_reservation_and_payment after insert or update of payment_status on public.event_participants for each row execute function private.notify_reservation_and_payment();
create or replace function public.get_private_event_by_invite_token(p_token uuid) returns setof public.events language sql stable security definer set search_path='' as $$
 select e.* from public.events e where e.invite_token=p_token and e.visibility='private' and e.status='published' and (e.starts_at>now() or e.organizer_id=auth.uid())
$$;
revoke all on function public.get_private_event_by_invite_token(uuid) from public;
grant execute on function public.get_private_event_by_invite_token(uuid) to anon,authenticated;
create unique index if not exists commission_payments_organizer_reference_uidx on public.commission_payments(organizer_id,reference) where reference is not null and btrim(reference)<>'';
create index if not exists commission_payment_submissions_pending_idx on public.commission_payment_submissions(status,created_at);
