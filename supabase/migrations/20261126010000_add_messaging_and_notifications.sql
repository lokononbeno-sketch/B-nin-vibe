create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint direct_messages_distinct_users check (sender_id <> recipient_id)
);
create index if not exists direct_messages_sender_created_idx on public.direct_messages(sender_id, created_at desc);
create index if not exists direct_messages_recipient_created_idx on public.direct_messages(recipient_id, created_at desc);
alter table public.direct_messages enable row level security;
drop policy if exists "Users read their direct messages" on public.direct_messages;
create policy "Users read their direct messages" on public.direct_messages for select to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);
drop policy if exists "Users send direct messages" on public.direct_messages;
create policy "Users send direct messages" on public.direct_messages for insert to authenticated
with check ((select auth.uid()) = sender_id and recipient_id <> (select auth.uid()) and char_length(trim(body)) between 1 and 4000);
drop policy if exists "Recipients mark messages read" on public.direct_messages;
create policy "Recipients mark messages read" on public.direct_messages for update to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);
grant select, insert, update on public.direct_messages to authenticated;
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('message','system')),
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated
using ((select auth.uid()) = recipient_id);
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);
grant select, update on public.notifications to authenticated;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.notify_direct_message()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications(recipient_id, actor_id, type, title, body, data)
  values (new.recipient_id, new.sender_id, 'message', 'Nouveau message',
          left(new.body, 180), jsonb_build_object('message_id', new.id, 'sender_id', new.sender_id));
  return new;
end;
$$;
revoke all on function private.notify_direct_message() from public, anon, authenticated;
drop trigger if exists direct_message_notification on public.direct_messages;
create trigger direct_message_notification after insert on public.direct_messages
for each row execute function private.notify_direct_message();
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='direct_messages') then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;