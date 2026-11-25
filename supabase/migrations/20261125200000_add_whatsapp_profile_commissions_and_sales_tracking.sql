-- Private WhatsApp contact lives in user_preferences, not public profiles.
-- Commission rates are configured by the platform admin per event.
-- Only an organizer-confirmed paid ticket generates a commission.
alter table public.user_preferences add column if not exists whatsapp_phone text;
alter table public.events add column if not exists commission_per_ticket numeric(12,2) not null default 0;
alter table public.event_participants add column if not exists payment_status text not null default 'pending';
alter table public.event_participants add column if not exists payment_confirmed_at timestamptz;
alter table public.event_participants add column if not exists payment_confirmed_by uuid references auth.users(id);
alter table public.event_participants drop constraint if exists event_participants_payment_status_check;
alter table public.event_participants add constraint event_participants_payment_status_check check (payment_status in ('pending','paid','rejected'));
alter table public.events drop constraint if exists events_commission_per_ticket_check;
alter table public.events add constraint events_commission_per_ticket_check check (commission_per_ticket >= 0);

create table if not exists public.platform_admins (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.platform_admins enable row level security;
create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.platform_admins where user_id=auth.uid()); $$;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

create table if not exists public.commission_payments (
 id uuid primary key default gen_random_uuid(),
 organizer_id uuid not null references auth.users(id),
 amount numeric(12,2) not null check(amount>0),
 paid_at timestamptz not null default now(),
 payment_method text, reference text, note text,
 recorded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.commission_payments enable row level security;
create policy "Admins read platform admins" on public.platform_admins for select to authenticated using(public.is_platform_admin());
create policy "Admins insert commission payments" on public.commission_payments for insert to authenticated with check(public.is_platform_admin() and recorded_by=auth.uid());
create policy "Admins update commission payments" on public.commission_payments for update to authenticated using(public.is_platform_admin()) with check(public.is_platform_admin());
create policy "Organizers read own commission payments" on public.commission_payments for select to authenticated using(organizer_id=auth.uid() or public.is_platform_admin());

create policy "Admins read all event participants" on public.event_participants for select to authenticated using(public.is_platform_admin());
create policy "Organizers confirm event payments" on public.event_participants for update to authenticated
 using(exists(select 1 from public.events e where e.id=event_participants.event_id and e.organizer_id=auth.uid()) or public.is_platform_admin())
 with check(exists(select 1 from public.events e where e.id=event_participants.event_id and e.organizer_id=auth.uid()) or public.is_platform_admin());
create policy "Admins update all events" on public.events for update to authenticated using(public.is_platform_admin()) with check(public.is_platform_admin());

create or replace function public.guard_event_financial_fields() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.commission_per_ticket is distinct from old.commission_per_ticket and not public.is_platform_admin() then raise exception 'Seul l’administrateur Bénin Vibe peut modifier la commission.'; end if;
 return new;
end; $$;
create trigger guard_event_financial_fields before update on public.events for each row execute function public.guard_event_financial_fields();

create or replace function public.guard_participant_payment_confirmation() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_owner uuid;
begin
 if new.payment_status is distinct from old.payment_status or new.payment_confirmed_at is distinct from old.payment_confirmed_at or new.payment_confirmed_by is distinct from old.payment_confirmed_by then
  select organizer_id into v_owner from public.events where id=old.event_id;
  if auth.uid() is distinct from v_owner and not public.is_platform_admin() then raise exception 'Seul l’organisateur peut confirmer le paiement.'; end if;
  if new.payment_status='paid' then new.payment_confirmed_at:=coalesce(new.payment_confirmed_at,now()); new.payment_confirmed_by:=coalesce(new.payment_confirmed_by,auth.uid());
  else new.payment_confirmed_at:=null; new.payment_confirmed_by:=null; end if;
 end if;
 return new;
end; $$;
create trigger guard_participant_payment_confirmation before update on public.event_participants for each row execute function public.guard_participant_payment_confirmation();

create or replace function public.get_public_event_ticket_counts(event_ids uuid[]) returns table(event_id uuid,ticket_count bigint)
language sql stable security definer set search_path=public,pg_temp as $$
 select p.event_id,coalesce(sum(p.ticket_quantity),0)::bigint from public.event_participants p join public.events e on e.id=p.event_id
 where p.event_id=any(event_ids) and p.status='going' and e.status='published' and e.visibility='public' group by p.event_id;
$$;
revoke all on function public.get_public_event_ticket_counts(uuid[]) from public;
grant execute on function public.get_public_event_ticket_counts(uuid[]) to anon,authenticated;

drop policy if exists "Published public events readable" on public.events;
create policy "Published public events readable" on public.events for select to public
using((status='published' and visibility='public') or organizer_id=auth.uid() or public.is_platform_admin()
 or exists(select 1 from public.event_participants p where p.event_id=events.id and p.user_id=auth.uid()));
