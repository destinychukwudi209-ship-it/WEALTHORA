-- WEALTHORA initial schema. Run in Supabase SQL editor.
create extension if not exists pgcrypto;
create type public.account_status as enum ('pending','active','frozen','suspended','closed');
create type public.user_role as enum ('customer','support','finance','admin','super_admin');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete restrict,
 full_name text not null default '', phone text unique, role public.user_role not null default 'customer',
 status public.account_status not null default 'pending', email_verified_at timestamptz,
 phone_verified_at timestamptz, two_factor_enabled boolean not null default false,
 transaction_pin_hash text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ledger_accounts(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), currency char(3) not null default 'NGN', created_at timestamptz not null default now(), unique(user_id,currency));
create table public.ledger_entries(id uuid primary key default gen_random_uuid(), account_id uuid not null references public.ledger_accounts(id), reference text not null unique, entry_type text not null check(entry_type in ('credit','debit')), amount numeric(18,2) not null check(amount>0), category text not null, status text not null check(status in ('pending','posted','reversed','failed')), idempotency_key text unique, description text, created_at timestamptz not null default now());
create table public.transactions(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), reference text not null unique, type text not null, amount numeric(18,2) not null check(amount>0), status text not null check(status in ('pending','approved','rejected','completed','failed','reversed')), provider_reference text, reviewed_by uuid references public.profiles(id), review_reason text, created_at timestamptz not null default now());
create table public.investment_plans(id text primary key, name text not null, capital numeric(18,2) not null, duration_days int not null, draft_daily_figure numeric(18,2), draft_projected_value numeric(18,2), approval_status text not null default 'pending_legal_review');
create table public.investments(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), plan_id text references public.investment_plans(id), principal numeric(18,2) not null check(principal>0), status text not null default 'pending', starts_at timestamptz, matures_at timestamptz, created_at timestamptz not null default now());
create table public.referrals(id uuid primary key default gen_random_uuid(), referrer_id uuid not null references public.profiles(id), referred_user_id uuid not null unique references public.profiles(id), code text not null, reward_status text not null default 'pending_review', created_at timestamptz not null default now());
create table public.promo_codes(id uuid primary key default gen_random_uuid(), code text not null unique, active boolean not null default true, starts_at timestamptz, expires_at timestamptz, max_uses int, uses int not null default 0, created_by uuid references public.profiles(id));
create table public.promo_redemptions(id uuid primary key default gen_random_uuid(), promo_id uuid not null references public.promo_codes(id), user_id uuid not null references public.profiles(id), status text not null default 'pending_review', created_at timestamptz not null default now(), unique(promo_id,user_id));
create table public.notifications(id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id), title text not null, body text not null, channel text not null default 'in_app', read_at timestamptz, created_at timestamptz not null default now());
create table public.support_tickets(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), subject text not null, status text not null default 'open', created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id), action text not null, target_type text, target_id text, metadata jsonb not null default '{}', ip_hash text, created_at timestamptz not null default now());
create table public.login_events(id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id), success boolean not null, user_agent text, ip_hash text, created_at timestamptz not null default now());
create table public.user_sessions(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), device_label text, last_seen_at timestamptz not null default now(), revoked_at timestamptz);
create table public.admin_action_approvals(id uuid primary key default gen_random_uuid(), action_key text not null, payload jsonb not null, requested_by uuid not null references public.profiles(id), approved_by uuid references public.profiles(id), status text not null default 'pending', created_at timestamptz not null default now(), check(approved_by is null or approved_by<>requested_by));
alter table public.profiles enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;
alter table public.referrals enable row level security;
alter table public.promo_redemptions enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs enable row level security;
alter table public.login_events enable row level security;
alter table public.user_sessions enable row level security;
alter table public.admin_action_approvals enable row level security;
-- Customers can only read their own profile and customer-owned records.
create policy profile_self_read on public.profiles for select using (auth.uid()=id);
create policy profile_self_update on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id and role='customer');
create policy ledger_account_self_read on public.ledger_accounts for select using (user_id=auth.uid());
create policy ledger_entry_self_read on public.ledger_entries for select using (account_id in (select id from public.ledger_accounts where user_id=auth.uid()));
create policy transaction_self_read on public.transactions for select using (user_id=auth.uid());
create policy investment_self_read on public.investments for select using (user_id=auth.uid());
create policy referral_participant_read on public.referrals for select using (referrer_id=auth.uid() or referred_user_id=auth.uid());
create policy promo_redemption_self_read on public.promo_redemptions for select using (user_id=auth.uid());
create policy notification_self_all on public.notifications for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy support_ticket_self_all on public.support_tickets for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy session_self_read on public.user_sessions for select using (user_id=auth.uid());
-- No customer policies on audit_logs, login_events or admin approvals: customers cannot access these.
-- Admin operations should go through trusted server routes using verified roles and least-privilege service credentials.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to browser code.

-- WEALTHORA: Admin-managed deposit bank accounts
create table public.deposit_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  instructions text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.deposit_accounts enable row level security;

-- Customers can only view active deposit accounts.
create policy deposit_accounts_customer_read
on public.deposit_accounts
for select
to authenticated
using (is_active = true);

-- Only active admins and super admins can manage accounts.
create policy deposit_accounts_admin_manage
on public.deposit_accounts
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
    and status = 'active'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
    and status = 'active'
  )
);

-- WEALTHORA: Audit deposit account changes
create or replace function public.audit_deposit_account_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'deposit_account_' || lower(TG_OP),
    'deposit_account',
    coalesce(NEW.id, OLD.id)::text,
    jsonb_build_object(
      'bank_name', coalesce(NEW.bank_name, OLD.bank_name),
      'account_name', coalesce(NEW.account_name, OLD.account_name),
      'account_number_last4',
        right(coalesce(NEW.account_number, OLD.account_number), 4),
      'operation', TG_OP
    )
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;

create trigger deposit_account_audit_trigger
after insert or update or delete
on public.deposit_accounts
for each row
execute function public.audit_deposit_account_changes();

-- ==========================================
-- WEALTHORA SECURITY CORRECTIONS
-- ==========================================

-- Enable RLS on tables that were missing it.
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Remove unsafe customer write policies.
DROP POLICY IF EXISTS profile_self_update ON public.profiles;
DROP POLICY IF EXISTS notification_self_all ON public.notifications;
DROP POLICY IF EXISTS support_ticket_self_all ON public.support_tickets;

-- Customers can only read their own profile.
CREATE POLICY profile_self_read
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Customers can only read their own notifications.
CREATE POLICY notification_self_read
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Customers can only mark their own notifications as read.
CREATE POLICY notification_self_update
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Customers can read and create their own support tickets.
CREATE POLICY support_ticket_self_read
ON public.support_tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY support_ticket_self_insert
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'open'
);

-- Remove broad table permissions before granting limited access.
REVOKE ALL ON TABLE
  public.profiles,
  public.ledger_accounts,
  public.ledger_entries,
  public.transactions,
  public.investments,
  public.referrals,
  public.promo_redemptions,
  public.notifications,
  public.support_tickets,
  public.audit_logs,
  public.login_events,
  public.user_sessions,
  public.admin_action_approvals,
  public.investment_plans,
  public.promo_codes,
  public.deposit_accounts
FROM anon, authenticated;

-- Customers may read selected profile fields.
-- The transaction PIN hash is deliberately excluded.
GRANT SELECT (
  id, full_name, phone, role, status,
  email_verified_at, phone_verified_at,
  two_factor_enabled, created_at, updated_at
) ON public.profiles TO authenticated;

-- Customers may update only their name and phone.
GRANT UPDATE (full_name, phone)
ON public.profiles TO authenticated;

-- Customer-owned financial records are read-only.
GRANT SELECT ON
  public.ledger_accounts,
  public.ledger_entries,
  public.transactions,
  public.investments,
  public.referrals,
  public.promo_redemptions
TO authenticated;

-- Notification access is limited.
GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

-- Support tickets: customers can read and submit, not approve or close.
GRANT SELECT, INSERT
ON public.support_tickets TO authenticated;

-- Customers can view their own sessions.
GRANT SELECT ON public.user_sessions TO authenticated;

-- Customers can view active deposit bank accounts.
-- Existing admin policy controls authorized management.
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.deposit_accounts TO authenticated;

-- No direct customer access to internal security or admin records.
REVOKE ALL ON
  public.audit_logs,
  public.login_events,
  public.admin_action_approvals,
  public.investment_plans,
  public.promo_codes
FROM anon, authenticated;

-- Correct deposit-account audit trigger for INSERT, UPDATE and DELETE.
DROP TRIGGER IF EXISTS deposit_account_audit_trigger
ON public.deposit_accounts;

CREATE OR REPLACE FUNCTION public.audit_deposit_account_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_id text;
  bank text;
  account text;
  number_last4 text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_id := OLD.id::text;
    bank := OLD.bank_name;
    account := OLD.account_name;
    number_last4 := right(OLD.account_number, 4);
  ELSE
    target_id := NEW.id::text;
    bank := NEW.bank_name;
    account := NEW.account_name;
    number_last4 := right(NEW.account_number, 4);
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, action, target_type, target_id, metadata
  )
  VALUES (
    auth.uid(),
    'deposit_account_' || lower(TG_OP),
    'deposit_account',
    target_id,
    jsonb_build_object(
      'bank_name', bank,
      'account_name', account,
      'account_number_last4', number_last4,
      'operation', TG_OP
    )
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION
  public.audit_deposit_account_changes()
FROM PUBLIC, anon, authenticated;

CREATE TRIGGER deposit_account_audit_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.deposit_accounts
FOR EACH ROW
EXECUTE FUNCTION public.audit_deposit_account_changes();

-- IMPORTANT:
-- Financial records must only be changed by trusted server-side
-- operations. Never expose the Supabase service-role key in a browser.


