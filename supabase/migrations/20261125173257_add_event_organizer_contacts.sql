alter table public.events
  add column if not exists whatsapp_phone text,
  add column if not exists facebook_url text;

comment on column public.events.whatsapp_phone is
  'Public WhatsApp contact for questions and ticket payment arrangements with the organizer.';
comment on column public.events.facebook_url is
  'Optional public Facebook profile or event page for additional event information.';
