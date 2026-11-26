create or replace function private.organizer_has_overdue_commission()
returns boolean language sql stable security definer set search_path = ''
as $$
  with current_user_id as (select auth.uid() as id),
  due_totals as (
    select
      coalesce(sum(ep.commission_per_ticket * greatest(ep.ticket_quantity,1)),0) as all_due,
      coalesce(sum(ep.commission_per_ticket * greatest(ep.ticket_quantity,1))
        filter (where ep.payment_confirmed_at <= now() - interval '48 hours'),0) as overdue_due
    from public.event_participants ep
    join public.events e on e.id=ep.event_id
    where e.organizer_id=(select id from current_user_id)
      and ep.payment_status='paid' and ep.status='going'
      and ep.payment_confirmed_at is not null
  ),
  paid_totals as (
    select coalesce(sum(cp.amount),0) as total_paid
    from public.commission_payments cp
    where cp.organizer_id=(select id from current_user_id)
  )
  select (select id from current_user_id) is not null
    and (select overdue_due from due_totals)>0
    and (select all_due from due_totals)>(select total_paid from paid_totals);
$$;
revoke all on function private.organizer_has_overdue_commission() from public;
grant execute on function private.organizer_has_overdue_commission() to authenticated;
drop policy if exists "Authenticated users create own events" on public.events;
create policy "Authenticated users create own events" on public.events for insert to authenticated
with check (organizer_id=(select auth.uid()) and not private.organizer_has_overdue_commission());
drop policy if exists "Organizers update own events" on public.events;
create policy "Organizers update own events" on public.events for update to authenticated
using (organizer_id=(select auth.uid()))
with check (organizer_id=(select auth.uid()) and not private.organizer_has_overdue_commission());