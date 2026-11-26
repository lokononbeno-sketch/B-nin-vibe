create table if not exists public.commission_payment_submissions (
 id uuid primary key default gen_random_uuid(),
 organizer_id uuid not null references auth.users(id) on delete cascade,
 amount numeric(12,2) not null check (amount > 0),
 payment_method text not null default 'Celtis Cash',
 reference text not null check (char_length(trim(reference)) >= 3),
 note text,
 status text not null default 'pending' check (status in ('pending','verified','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id)
);
alter table public.commission_payment_submissions enable row level security;
drop policy if exists "Organizers submit own commission transfers" on public.commission_payment_submissions;
create policy "Organizers submit own commission transfers"
on public.commission_payment_submissions for insert to authenticated
with check (organizer_id = (select auth.uid()) and status='pending' and reviewed_at is null and reviewed_by is null);
drop policy if exists "Organizers read own commission transfer submissions" on public.commission_payment_submissions;
create policy "Organizers read own commission transfer submissions"
on public.commission_payment_submissions for select to authenticated
using (organizer_id = (select auth.uid()) or public.is_platform_admin());
drop policy if exists "Admins review commission transfer submissions" on public.commission_payment_submissions;
create policy "Admins review commission transfer submissions"
on public.commission_payment_submissions for update to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());
