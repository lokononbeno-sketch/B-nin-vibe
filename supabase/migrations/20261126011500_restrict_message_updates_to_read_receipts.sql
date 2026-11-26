revoke update on public.direct_messages from authenticated;
grant update (read_at) on public.direct_messages to authenticated;
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;