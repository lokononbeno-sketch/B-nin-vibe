-- Keep admin checks private to authenticated sessions and prevent public invocation of trigger-only functions.
revoke all on function public.is_platform_admin() from anon, public;
grant execute on function public.is_platform_admin() to authenticated;
revoke all on function public.reserve_event_tickets(uuid,integer) from anon, public;
grant execute on function public.reserve_event_tickets(uuid,integer) to authenticated;
revoke all on function public.cancel_event_reservation(uuid) from anon, public;
grant execute on function public.cancel_event_reservation(uuid) to authenticated;
revoke all on function public.guard_event_financial_fields() from anon, authenticated, public;
revoke all on function public.guard_participant_payment_confirmation() from anon, authenticated, public;
revoke all on function public.prevent_paid_ticket_changes() from anon, authenticated, public;

drop policy if exists "Published public events readable" on public.events;
drop policy if exists "Public reads published events" on public.events;
drop policy if exists "Admins read all events" on public.events;
create policy "Public reads published events" on public.events for select to anon, authenticated
using((status='published' and visibility='public') or organizer_id=auth.uid()
 or exists(select 1 from public.event_participants p where p.event_id=events.id and p.user_id=auth.uid()));
create policy "Admins read all events" on public.events for select to authenticated using(public.is_platform_admin());
