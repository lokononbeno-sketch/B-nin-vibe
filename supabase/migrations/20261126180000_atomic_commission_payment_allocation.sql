create or replace function public.admin_record_commission_payment(p_organizer_id uuid,p_amount numeric,p_method text,p_reference text,p_submission_id uuid default null)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_payment_id uuid; v_remaining numeric; o record; v_open numeric; v_alloc numeric; s public.commission_payment_submissions%rowtype;
begin
 if not public.is_platform_admin() then raise exception 'Accès administrateur requis'; end if;
 if p_amount<=0 then raise exception 'Montant invalide'; end if;
 if p_submission_id is not null then
  select * into s from public.commission_payment_submissions where id=p_submission_id for update;
  if not found or s.status<>'pending' or s.organizer_id<>p_organizer_id or s.amount<>p_amount then raise exception 'Déclaration invalide ou déjà traitée'; end if;
 end if;
 if p_reference is not null and exists(select 1 from public.commission_payments where organizer_id=p_organizer_id and reference=p_reference) then raise exception 'Référence de transfert déjà utilisée'; end if;
 insert into public.commission_payments(organizer_id,amount,payment_method,reference,recorded_by) values(p_organizer_id,p_amount,p_method,nullif(btrim(p_reference),''),auth.uid()) returning id into v_payment_id;
 v_remaining:=p_amount;
 for o in select id,amount from public.commission_obligations where organizer_id=p_organizer_id order by due_at,id for update loop
  exit when v_remaining<=0;
  select greatest(0,o.amount-coalesce(sum(a.amount),0)) into v_open from public.commission_payment_allocations a where a.obligation_id=o.id;
  if v_open>0 then v_alloc:=least(v_remaining,v_open);insert into public.commission_payment_allocations(payment_id,obligation_id,amount) values(v_payment_id,o.id,v_alloc);v_remaining:=v_remaining-v_alloc;end if;
 end loop;
 if p_submission_id is not null then update public.commission_payment_submissions set status='verified',reviewed_at=now(),reviewed_by=auth.uid() where id=p_submission_id;end if;
 return v_payment_id;
end $$;
revoke all on function public.admin_record_commission_payment(uuid,numeric,text,text,uuid) from public,anon;
grant execute on function public.admin_record_commission_payment(uuid,numeric,text,text,uuid) to authenticated;