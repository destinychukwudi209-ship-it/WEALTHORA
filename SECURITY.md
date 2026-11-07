# Security policy

- Never commit `.env.local`, API keys, service-role keys, signing secrets or payment credentials.
- Supabase service-role key is server-only and bypasses RLS; restrict its use to audited server operations.
- Admin privileges must be checked server-side from the database on every protected request. Never trust client role claims.
- Do not permit customers to update their own role, status, balance, ledger entries or investment entitlements.
- Require step-up authentication (2FA/OTP) for bank changes, withdrawals, password changes and sensitive admin actions.
- Use a strong managed password hashing/authentication provider. Do not store plaintext passwords or PINs.
- Store transaction PINs only as salted, slow password hashes (Argon2id/bcrypt) with rate limiting and lockout. The schema's `transaction_pin_hash` is a placeholder field, not an implementation.
- Use idempotency keys and database transactions for all money movement. Ledger entries must be append-only; reversals are new entries, never edits/deletes.
- Require independent second-person approval for high-risk admin actions and payout completion.
- Use Redis/managed rate limiting in production; the included in-memory helper is not distributed.
- Enable provider webhook signature verification, replay protection, reconciliation and alerting.
- Run dependency scanning, penetration testing, backup restore drills and incident-response exercises before launch.
