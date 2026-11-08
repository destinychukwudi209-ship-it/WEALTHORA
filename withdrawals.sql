
-- =====================================================
-- WEALTHORA TASK WITHDRAWALS
-- Run only AFTER supabase/schema.sql
-- Nigeria time: Africa/Lagos
-- =====================================================

-- Add payment reference.
ALTER TABLE public.withdrawal_requests
ADD COLUMN IF NOT EXISTS payment_reference text;

-- Prevent reuse of a payment reference.
CREATE UNIQUE INDEX IF NOT EXISTS
  withdrawal_payment_reference_unique
ON public.withdrawal_requests (payment_reference)
WHERE payment_reference IS NOT NULL
  AND pg_catalog.btrim(payment_reference) <> '';

-- Customers can read their own requests.
-- Active administrators can read all requests.
DROP POLICY IF EXISTS withdrawal_admin_read
ON public.withdrawal_requests;

CREATE POLICY withdrawal_admin_read
ON public.withdrawal_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
      AND p.status = 'active'
  )
);

-- -----------------------------------------------------
