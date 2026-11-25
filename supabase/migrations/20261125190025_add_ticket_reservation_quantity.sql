alter table public.event_participants
  add column if not exists ticket_quantity integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_participants_ticket_quantity_check'
      and conrelid = 'public.event_participants'::regclass
  ) then
    alter table public.event_participants
      add constraint event_participants_ticket_quantity_check
      check (ticket_quantity between 1 and 10);
  end if;
end $$;
