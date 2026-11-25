alter table public.event_participants
  add column if not exists ticket_quantity integer not null default 1;
alter table public.event_participants
  add constraint event_participants_ticket_quantity_check
  check (ticket_quantity between 1 and 10);
