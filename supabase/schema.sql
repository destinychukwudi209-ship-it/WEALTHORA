
-- =====================================================
-- WEALTHORA COMPLETE DATABASE SCHEMA
-- Initial secure setup for Supabase
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------
-- 1. ENUM TYPES
-- -----------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM
    ('pending','active','frozen','suspended','closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM
    ('customer','support','finance','admin','super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.balance_type AS ENUM
    ('main','task','affiliate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ledger_entry_type AS ENUM
    ('credit','debit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ledger_entry_status AS ENUM
    ('pending','posted','reversed','failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.withdrawal_status AS ENUM
    ('pending','approved','rejected','paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------
-- 2. CUSTOMER PROFILES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text UNIQUE,
  role public.user_role NOT NULL DEFAULT 'customer',
  status public.account_status NOT NULL DEFAULT 'pending',
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  transaction_pin_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- 3. SEPARATE WALLET ACCOUNTS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ledger_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  currency char(3) NOT NULL DEFAULT 'NGN',
  balance_type public.balance_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,currency,balance_type)
);

-- -----------------------------------------------------
-- 4. FINANCIAL LEDGER
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.ledger_accounts(id),
  reference text NOT NULL UNIQUE,
  entry_type public.ledger_entry_type NOT NULL,
  amount numeric(18,2) NOT NULL CHECK(amount > 0),
  category text NOT NULL,
  status public.ledger_entry_status NOT NULL DEFAULT 'pending',
  idempotency_key text UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Wallet balances must be calculated from posted ledger entries.
-- Never accept a customer-supplied balance as authoritative.

-- -----------------------------------------------------
-- 5. TRANSACTIONS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  reference text NOT NULL UNIQUE,
  type text NOT NULL,
  amount numeric(18,2) NOT NULL CHECK(amount > 0),
  status text NOT NULL CHECK (
    status IN (
      'pending','approved','rejected',
      'completed','failed','reversed'
    )
  ),
  provider_reference text,
  reviewed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- 6. INVESTMENT PLANS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.investment_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  capital numeric(18,2) NOT NULL CHECK(capital > 0),
  duration_days integer NOT NULL CHECK(duration_days > 0),
  draft_daily_figure numeric(18,2),
  draft_projected_value numeric(18,2),
  approval_status text NOT NULL DEFAULT 'pending_legal_review'
);

CREATE TABLE IF NOT EXISTS public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  plan_id text REFERENCES public.investment_plans(id),
  principal numeric(18,2) NOT NULL CHECK(principal > 0),
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  matures_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- 7. REFERRALS AND PROMOTIONS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id),
  code text NOT NULL,
  reward_status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id uuid NOT NULL REFERENCES public.promo_codes(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(promo_id,user_id)
);

-- -----------------------------------------------------
-- 8. NOTIFICATIONS AND SUPPORT
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  body text NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- 9. TASK BALANCE WITHDRAWAL REQUESTS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  account_id uuid NOT NULL REFERENCES public.ledger_accounts(id),
  amount numeric(18,2) NOT NULL CHECK(amount > 0),
  balance_type public.balance_type NOT NULL DEFAULT 'task'
    CHECK(balance_type = 'task'),
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  refund_entry_id uuid UNIQUE REFERENCES public.ledger_entries(id),
  reviewed_by uuid REFERENCES public.profiles(id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  paid_at timestamptz
);

-- No customer direct INSERT or UPDATE permission.
-- Trusted server-side code must enforce the 30th-day
-- WAT withdrawal window and prevent duplicate refunds.
-- Rejections must refund exactly once.
-- Approval does not mean payment has been made.

-- -----------------------------------------------------
-- 10. DEPOSIT BANK ACCOUNTS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.deposit_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  instructions text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- 11. SECURITY AND ADMIN AUDIT RECORDS
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  success boolean NOT NULL,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  device_label text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.admin_action_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key text NOT NULL,
  payload jsonb NOT NULL,
  requested_by uuid NOT NULL REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(approved_by IS NULL OR approved_by <> requested_by)
);

-- -----------------------------------------------------
-- 12. AUTOMATIC CUSTOMER SETUP
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_wealthora_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email_verified_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name',''),
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.ledger_accounts(user_id,balance_type)
  VALUES
    (NEW.id,'main'),
    (NEW.id,'task'),
    (NEW.id,'affiliate')
  ON CONFLICT (user_id,currency,balance_type) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_wealthora_user_created ON auth.users;

CREATE TRIGGER on_wealthora_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_wealthora_profile();

-- Set up existing authenticated users too.
INSERT INTO public.profiles(id,full_name,email_verified_at)
SELECT
  id,
  COALESCE(raw_user_meta_data ->> 'full_name',''),
  email_confirmed_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ledger_accounts(user_id,balance_type)
SELECT p.id, b.balance_type
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('main'::public.balance_type),
    ('task'::public.balance_type),
    ('affiliate'::public.balance_type)
) AS b(balance_type)
ON CONFLICT (user_id,currency,balance_type) DO NOTHING;

-- -----------------------------------------------------
-- 13. ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_approvals ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 14. REMOVE OLD POLICIES
-- -----------------------------------------------------

DROP POLICY IF EXISTS profile_self_read ON public.profiles;
DROP POLICY IF EXISTS ledger_account_self_read ON public.ledger_accounts;
DROP POLICY IF EXISTS ledger_entry_self_read ON public.ledger_entries;
DROP POLICY IF EXISTS transaction_self_read ON public.transactions;
DROP POLICY IF EXISTS investment_plan_approved_read ON public.investment_plans;
DROP POLICY IF EXISTS investment_self_read ON public.investments;
DROP POLICY IF EXISTS referral_participant_read ON public.referrals;
DROP POLICY IF EXISTS promo_redemption_self_read ON public.promo_redemptions;
DROP POLICY IF EXISTS notification_self_read ON public.notifications;
DROP POLICY IF EXISTS notification_self_update ON public.notifications;
DROP POLICY IF EXISTS support_ticket_self_read ON public.support_tickets;
DROP POLICY IF EXISTS support_ticket_self_insert ON public.support_tickets;
DROP POLICY IF EXISTS withdrawal_self_read ON public.withdrawal_requests;
DROP POLICY IF EXISTS deposit_accounts_customer_read ON public.deposit_accounts;
DROP POLICY IF EXISTS deposit_accounts_admin_manage ON public.deposit_accounts;
DROP POLICY IF EXISTS session_self_read ON public.user_sessions;


-- -----------------------------------------------------
-- 15. CUSTOMER READ POLICIES
-- -----------------------------------------------------

CREATE POLICY profile_self_read
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY ledger_account_self_read
ON public.ledger_accounts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY ledger_entry_self_read
ON public.ledger_entries FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.ledger_accounts a
    WHERE a.id = public.ledger_entries.account_id
      AND a.user_id = auth.uid()
  )
);

CREATE POLICY transaction_self_read
ON public.transactions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY investment_plan_approved_read
ON public.investment_plans FOR SELECT TO authenticated
USING (approval_status = 'approved');

CREATE POLICY investment_self_read
ON public.investments FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY referral_participant_read
ON public.referrals FOR SELECT TO authenticated
USING (
  referrer_id = auth.uid()
  OR referred_user_id = auth.uid()
);

CREATE POLICY promo_redemption_self_read
ON public.promo_redemptions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY notification_self_read
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY notification_self_update
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY support_ticket_self_read
ON public.support_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY support_ticket_self_insert
ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'open'
);

CREATE POLICY withdrawal_self_read
ON public.withdrawal_requests FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY deposit_accounts_customer_read
ON public.deposit_accounts FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY deposit_accounts_admin_manage
ON public.deposit_accounts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
      AND p.status = 'active'
  )
);

CREATE POLICY session_self_read
ON public.user_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------
-- END OF SECTION 15
-- -----------------------------------------------------


-- -----------------------------------------------------

-- -----------------------------------------------------
-- 16. TABLE PERMISSIONS
-- -----------------------------------------------------

REVOKE ALL ON
  public.profiles,
  public.ledger_accounts,
  public.ledger_entries,
  public.transactions,
  public.investment_plans,
  public.investments,
  public.referrals,
  public.promo_codes,
  public.promo_redemptions,
  public.notifications,
  public.support_tickets,
  public.withdrawal_requests,
  public.deposit_accounts,
  public.audit_logs,
  public.login_events,
  public.user_sessions,
  public.admin_action_approvals
FROM PUBLIC, anon, authenticated;

-- Profile fields: never expose PIN hashes.
GRANT SELECT (
  id, full_name, phone, role, status,
  email_verified_at, phone_verified_at,
  two_factor_enabled, created_at, updated_at
) ON public.profiles TO authenticated;

-- Read-only customer financial data.
GRANT SELECT ON
  public.ledger_accounts,
  public.ledger_entries,
  public.transactions,
  public.investments,
  public.referrals,
  public.promo_redemptions,
  public.investment_plans
TO authenticated;

-- Notification read and read-status update only.
GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

-- Customers can create and read their own support tickets.
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT INSERT (user_id, subject)
ON public.support_tickets TO authenticated;

-- Customers can view withdrawal history.
GRANT SELECT ON public.withdrawal_requests TO authenticated;

-- Deposit accounts: RLS controls customer and admin access.
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.deposit_accounts TO authenticated;

-- Customers can view their own sessions.
GRANT SELECT ON public.user_sessions TO authenticated;

-- Internal tables remain inaccessible to customers.
REVOKE ALL ON
  public.audit_logs,
  public.login_events,
  public.admin_action_approvals,
  public.promo_codes
FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------

-- -----------------------------------------------------
-- 17. DEPOSIT ACCOUNT AUDIT TRIGGER
-- -----------------------------------------------------

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
    number_last4 := pg_catalog.right(OLD.account_number,4);
  ELSE
    target_id := NEW.id::text;
    bank := NEW.bank_name;
    account := NEW.account_name;
    number_last4 := pg_catalog.right(NEW.account_number,4);
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, action, target_type, target_id, metadata
  )
  VALUES (
    auth.uid(),
    'deposit_account_' || pg_catalog.lower(TG_OP),
    'deposit_account',
    target_id,
    pg_catalog.jsonb_build_object(
      'bank_name',bank,
      'account_name',account,
      'account_number_last4',number_last4,
      'operation',TG_OP
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

DROP TRIGGER IF EXISTS deposit_account_audit_trigger
ON public.deposit_accounts;

CREATE TRIGGER deposit_account_audit_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.deposit_accounts
FOR EACH ROW
EXECUTE FUNCTION public.audit_deposit_account_changes();

-- -----------------------------------------------------
-- 18. IMPORTANT SECURITY RULES
-- -----------------------------------------------------

-- Never expose SUPABASE_SERVICE_ROLE_KEY in browser code.
-- Never let customers write directly to financial ledgers.
-- Trusted server operations must validate every transaction.
-- Withdrawal schedule: day 30, 8:50 PM to 10:20 PM WAT.
-- Pending requests require administrator review.
-- Rejected withdrawals must be refunded exactly once.
-- Do not display rejection reasons to customers.
-- Approved withdrawals may take up to 3 days.
-- Only mark a withdrawal paid after payment verification.
-- Main, Task and Affiliate balances must remain separate.
-- Investment purchases stay disabled pending legal review.
-- Do not process real customer funds until all controls
-- and regulatory requirements have been independently checked.
