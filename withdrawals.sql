
-- =====================================================
-- WEALTHORA TASK WITHDRAWAL PROCESSING
-- Nigeria time: Africa/Lagos (WAT)
-- Run AFTER schema.sql has been successfully executed.
-- =====================================================

ALTER TABLE public.withdrawal_requests
ADD COLUMN IF NOT EXISTS payment_reference text;

-- -----------------------------------------------------
-- 1. CUSTOMER REQUESTS A TASK BALANCE WITHDRAWAL
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.request_task_withdrawal(
  p_amount numeric,
  p_bank_name text,
  p_account_name text,
  p_account_number text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_account_id uuid;
  v_request_id uuid;
  v_balance numeric(18,2);
  v_local_time timestamp without time zone;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must sign in first.';
  END IF;

  v_local_time := pg_catalog.now() AT TIME ZONE 'Africa/Lagos';

  IF EXTRACT(DAY FROM v_local_time) <> 30
     OR v_local_time::time < TIME '20:50'
     OR v_local_time::time >= TIME '22:20' THEN
    RAISE EXCEPTION 'Task Balance withdrawals are currently closed.';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Enter a valid withdrawal amount.';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_bank_name, '')) = ''
     OR pg_catalog.btrim(COALESCE(p_account_name, '')) = ''
     OR pg_catalog.btrim(COALESCE(p_account_number, '')) = '' THEN
    RAISE EXCEPTION 'Complete your bank details.';
  END IF;

  SELECT id
  INTO v_account_id
  FROM public.ledger_accounts
  WHERE user_id = v_user_id
    AND balance_type = 'task'
    AND currency = 'NGN'
  FOR UPDATE;

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Task Balance account not found.';
  END IF;

  SELECT COALESCE(
    SUM(
      CASE
        WHEN entry_type = 'credit' THEN amount
        WHEN entry_type = 'debit' THEN -amount
        ELSE 0
      END
    ), 0
  )
  INTO v_balance
  FROM public.ledger_entries
  WHERE account_id = v_account_id
    AND status = 'posted';

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient Task Balance.';
  END IF;

  INSERT INTO public.withdrawal_requests (
    user_id,
    account_id,
    amount,
    balance_type,
    bank_name,
    account_name,
    account_number,
    status
  )
  VALUES (
    v_user_id,
    v_account_id,
    p_amount,
    'task',
    pg_catalog.btrim(p_bank_name),
    pg_catalog.btrim(p_account_name),
    pg_catalog.btrim(p_account_number),
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Hold the requested amount immediately.
  -- This prevents spending the same money twice.
  INSERT INTO public.ledger_entries (
    account_id,
    reference,
    entry_type,
    amount,
    category,
    status,
    idempotency_key,
    description
  )
  VALUES (
    v_account_id,
    'WDR-HOLD-' || v_request_id::text,
    'debit',
    p_amount,
    'task_withdrawal_hold',
    'posted',
    'withdrawal-hold:' || v_request_id::text,
    'Task withdrawal awaiting administrator review'
  );

  RETURN v_request_id;
END;
$$;

-- -----------------------------------------------------
-- 2. ADMIN APPROVES OR REJECTS A REQUEST
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.review_task_withdrawal(
  p_request_id uuid,
  p_decision text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id uuid;
  v_request public.withdrawal_requests%ROWTYPE;
  v_refund_id uuid;
BEGIN
  v_admin_id := auth.uid();

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Sign in required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_admin_id
      AND role IN ('admin', 'super_admin')
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Administrator permission required.';
  END IF;

  IF p_decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid administrator decision.';
  END IF;

  SELECT *
  INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found.';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'This request has already been reviewed.';
  END IF;

  IF p_decision = 'approve' THEN

    UPDATE public.withdrawal_requests
    SET status = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = pg_catalog.now()
    WHERE id = p_request_id;

  ELSE

    -- Refund the held amount exactly once.
    INSERT INTO public.ledger_entries (
      account_id,
      reference,
      entry_type,
      amount,
      category,
      status,
      idempotency_key,
      description
    )
    VALUES (
      v_request.account_id,
      'WDR-REFUND-' || p_request_id::text,
      'credit',
      v_request.amount,
      'task_withdrawal_refund',
      'posted',
      'withdrawal-refund:' || p_request_id::text,
      'Refund of rejected Task Balance withdrawal'
    )
    RETURNING id INTO v_refund_id;

    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        refund_entry_id = v_refund_id,
        reviewed_by = v_admin_id,
        reviewed_at = pg_catalog.now()
    WHERE id = p_request_id;

  END IF;

  INSERT INTO public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_admin_id,
    'task_withdrawal_' || p_decision,
    'withdrawal_request',
    p_request_id::text,
    pg_catalog.jsonb_build_object(
      'amount', v_request.amount,
      'user_id', v_request.user_id
    )
  );
END;
$$;

-- -----------------------------------------------------
-- 3. ADMIN MARKS A VERIFIED PAYMENT AS PAID
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_task_withdrawal_paid(
  p_request_id uuid,
  p_payment_reference text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id uuid;
  v_request public.withdrawal_requests%ROWTYPE;
BEGIN
  v_admin_id := auth.uid();

  IF v_admin_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_admin_id
      AND role IN ('admin', 'super_admin')
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Administrator permission required.';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_payment_reference, '')) = '' THEN
    RAISE EXCEPTION 'A verified payment reference is required.';
  END IF;

  SELECT *
  INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR v_request.status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved requests can be marked paid.';
  END IF;

  UPDATE public.withdrawal_requests
  SET status = 'paid',
      payment_reference = pg_catalog.btrim(p_payment_reference),
      paid_at = pg_catalog.now()
  WHERE id = p_request_id;

  INSERT INTO public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_admin_id,
    'task_withdrawal_paid',
    'withdrawal_request',
    p_request_id::text,
    pg_catalog.jsonb_build_object(
      'payment_reference', pg_catalog.btrim(p_payment_reference),
      'amount', v_request.amount
    )
  );
END;
$$;

-- -----------------------------------------------------
-- 4. FUNCTION ACCESS
-- -----------------------------------------------------

REVOKE ALL ON FUNCTION
  public.request_task_withdrawal(numeric, text, text, text)
FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION
  public.review_task_withdrawal(uuid, text)
FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION
  public.mark_task_withdrawal_paid(uuid, text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  public.request_task_withdrawal(numeric, text, text, text)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.review_task_withdrawal(uuid, text)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.mark_task_withdrawal_paid(uuid, text)
TO authenticated;

-- =====================================================
-- END OF WITHDRAWAL PROCESSING FUNCTIONS
-- =====================================================
