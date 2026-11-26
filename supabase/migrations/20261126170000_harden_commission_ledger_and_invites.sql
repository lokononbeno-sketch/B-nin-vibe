create unique index if not exists commission_payments_organizer_reference_uidx on public.commission_payments(organizer_id,reference) where reference is not null and btrim(reference)<>'';
create index if not exists commission_payment_submissions_pending_idx on public.commission_payment_submissions(status,created_at);
create index if not exists commission_obligations_unpaid_due_idx on public.commission_obligations(organizer_id,due_at);
