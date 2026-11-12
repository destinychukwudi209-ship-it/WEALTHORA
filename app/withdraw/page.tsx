
"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Shell, PageTitle } from "@/components/shell";

type BalanceType = "task" | "affiliate";

type Withdrawal = {
  id: string;
  amount: number;
  balance_type: BalanceType;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  paid_at: string | null;
};

type Account = {
  id: string;
  balance_type: string;
};

type LedgerEntry = {
  account_id: string;
  entry_type: string;
  amount: number | string;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const messages: Record<string, string> = {
  unauthenticated: "Your session has expired. Please sign in again.",
  invalid_balance_type: "Only Task Balance and Affiliate Balance can be withdrawn.",
  invalid_amount: "Enter a valid positive amount with no more than two decimal places.",
  invalid_bank_details: "Check your bank name, account name and 10-digit account number.",
  invalid_pin: "Your Transaction PIN must contain exactly six digits.",
  invalid_request_key: "The request could not be identified safely. Please try again.",
  withdrawals_disabled: "Withdrawals are temporarily unavailable.",
  account_not_eligible: "Your account is not currently eligible for withdrawals.",
  email_not_verified: "Please verify your email address before withdrawing.",
  task_withdrawal_window_closed: "Task Balance withdrawals open on the 30th of each month, from 8:50 PM to 10:20 PM Nigeria time.",
  affiliate_withdrawal_window_closed: "Affiliate withdrawals open daily from 8:40 AM to 10:00 AM Nigeria time.",
  affiliate_eligibility_required: "You need at least one successful deposit or completed investment purchase in your account history to withdraw Affiliate Balance.",
  locked: "Too many incorrect PIN attempts. Your Transaction PIN is locked for 15 minutes.",
  incorrect_pin: "Your Transaction PIN is incorrect.",
  pin_not_set: "Create your Transaction PIN in Security & Settings before withdrawing.",
  wallet_not_found: "Your withdrawal wallet could not be found. Please contact support.",
  insufficient_balance: "Your available balance is insufficient.",
  duplicate_request: "This submission was already processed or attempted. Do not submit it again. Check your withdrawal history or contact support.",
};

export default function WithdrawPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [balanceType, setBalanceType] = useState<BalanceType>("affiliate");
  const [balances, setBalances] = useState({
    task: 0,
    affiliate: 0,
  });

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");

  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balanceError, setBalanceError] = useState("");

  const idempotencyKey = useRef("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingBalances(true);
    setError("");
    setBalanceError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Please sign in to use withdrawals.");
        setLoading(false);
        setLoadingBalances(false);
        return;
      }

      const [requestResult, accountResult] = await Promise.all([
        supabase
          .from("withdrawal_requests")
          .select("id,amount,balance_type,status,requested_at,reviewed_at,paid_at")
          .eq("user_id", user.id)
          .order("requested_at", { ascending: false })
          .limit(20),

        supabase
          .from("ledger_accounts")
          .select("id,balance_type")
          .eq("user_id", user.id)
          .eq("currency", "NGN"),
      ]);

      if (requestResult.error) {
        setError("Unable to load withdrawal history. Please refresh.");
      } else {
        setRequests((requestResult.data ?? []) as Withdrawal[]);
      }

      if (accountResult.error) {
        setBalanceError("Unable to load your wallet balances. Please refresh.");
      } else {
        const accounts = (accountResult.data ?? []) as Account[];
        const accountIds = accounts.map((account) => account.id);
        const next = { task: 0, affiliate: 0 };

        if (accountIds.length > 0) {
          const { data: entries, error: entriesError } = await supabase
            .from("ledger_entries")
            .select("account_id,entry_type,amount")
            .in("account_id", accountIds)
            .eq("status", "posted");

          if (entriesError) {
            setBalanceError("Unable to load your wallet transactions. Please refresh.");
          } else {
            for (const entry of (entries ?? []) as LedgerEntry[]) {
              const account = accounts.find(
                (item) => item.id === entry.account_id
              );

              if (
                !account ||
                !["task", "affiliate"].includes(account.balance_type)
              ) {
                continue;
              }

              const type = account.balance_type as BalanceType;
              const value = Number(entry.amount);

              if (!Number.isFinite(value)) continue;

              next[type] +=
                entry.entry_type === "credit" ? value : -value;
            }
          }
        }

        setBalances(next);
      }
    } catch {
      setError("Something went wrong while loading your withdrawal information.");
      setBalanceError("Unable to load wallet balances.");
    } finally {
      setLoading(false);
      setLoadingBalances(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const parsedAmount = Number(amount.trim());

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(amount.trim())
    ) {
      setError("Enter a valid positive amount with no more than two decimal places.");
      return;
    }

    if (bankName.trim().length < 2 || bankName.trim().length > 100) {
      setError("Enter a valid bank name.");
      return;
    }

    if (accountName.trim().length < 2 || accountName.trim().length > 120) {
      setError("Enter a valid account name.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setError("Enter a valid 10-digit bank account number.");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your six-digit Transaction PIN.");
      return;
    }

    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }

    setSubmitting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "request_withdrawal_secure",
        {
          p_balance_type: balanceType,
          p_amount: parsedAmount,
          p_bank_name: bankName.trim(),
          p_account_name: accountName.trim(),
          p_bank_account_number: accountNumber,
          p_pin: pin,
          p_idempotency_key: idempotencyKey.current,
        }
      );

      if (rpcError) {
        setError(
          "We could not confirm the request. Please check your withdrawal history before trying again."
        );
        return;
      }

      const result = data as {
        ok?: boolean;
        code?: string;
        request_id?: string;
        status?: string;
      };

      if (!result?.ok) {
        const code = result?.code ?? "";
        setError(
          messages[code] ??
            "Your withdrawal request could not be completed. Please contact support."
        );

        if (code !== "duplicate_request") {
          idempotencyKey.current = "";
        }

        return;
      }

      setSuccess(
        `Your withdrawal request is pending administrator review. Reference: ${result.request_id ?? "received"}`
      );

      idempotencyKey.current = "";
      setAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setPin("");

      await loadData();
    } catch {
      setError(
        "We could not confirm the request. Check your withdrawal history before submitting another request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell>
      <PageTitle
        title="Withdraw Funds"
        subtitle="Request a withdrawal from your eligible WEALTHORA wallet."
      />

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-[#0b2118]">
          Available withdrawal balances
        </h2>

        {loadingBalances ? (
          <p className="mt-3 text-sm text-slate-500">
            Loading your balances...
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Task Balance
              </p>
              <p className="mt-2 text-xl font-extrabold text-[#0b2118]">
                {money.format(balances.task)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Affiliate Balance
              </p>
              <p className="mt-2 text-xl font-extrabold text-[#0b2118]">
                {money.format(balances.affiliate)}
              </p>
            </div>
          </div>
        )}

        {balanceError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {balanceError}
          </p>
        )}

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading || submitting}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 disabled:opacity-50"
        >
          Refresh balances and history
        </button>
      </section>

      <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="font-extrabold text-emerald-950">
          Withdrawal schedules
        </h2>

        <div className="mt-4 space-y-3 text-sm text-emerald-900">
          <div>
            <p className="font-bold">Task Balance</p>
            <p>Every 30th of the month, 8:50 PM – 10:20 PM WAT.</p>
          </div>

          <div>
            <p className="font-bold">Affiliate Balance</p>
            <p>Every day, 8:40 AM – 10:00 AM WAT.</p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-emerald-800">
          Affiliate withdrawal eligibility requires at least one successful
          deposit or completed investment purchase in your account history.
          Main Balance is not withdrawable.
        </p>
      </section>

      <form
        onSubmit={submitWithdrawal}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-extrabold text-[#0b2118]">
          New withdrawal request
        </h2>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Select wallet
          </label>
          <select
            value={balanceType}
            onChange={(event) =>
              setBalanceType(event.target.value as BalanceType)
            }
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900"
          >
            <option value="task">Task Balance</option>
            <option value="affiliate">Affiliate Balance</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Withdrawal amount (₦)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            Available: {loadingBalances ? "Loading..." : money.format(balances[balanceType])}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Bank name
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="off"
            value={bankName}
            onChange={(event) => setBankName(event.target.value)}
            placeholder="Enter bank name"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Account name
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="off"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            placeholder="Name on bank account"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            10-digit bank account number
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            pattern="[0-9]{10}"
            required
            value={accountNumber}
            onChange={(event) =>
              setAccountNumber(
                event.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="0123456789"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Six-digit Transaction PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            value={pin}
            onChange={(event) =>
              setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter transaction PIN"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || loadingBalances || Boolean(balanceError)}
          className="w-full rounded-xl bg-[#0b2118] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting securely..." : "Submit withdrawal request"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Your bank account number is encrypted before it is stored.
          Your Transaction PIN is checked securely by the database and is
          not saved by this page. Never share your PIN with anyone.
        </p>
      </form>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#0b2118]">
            Withdrawal history
          </h2>
          <span className="text-xs text-slate-500">
            Latest 20 requests
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">
            Loading your withdrawal history...
          </p>
        ) : requests.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            You have no withdrawal requests yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold text-slate-900">
                    {request.balance_type === "task"
                      ? "Task Balance"
                      : "Affiliate Balance"}
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                    {request.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="mt-3 text-xl font-extrabold text-[#0b2118]">
                  {money.format(Number(request.amount))}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Requested: {new Date(request.requested_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                </p>

                {request.reviewed_at && (
                  <p className="mt-1 text-xs text-slate-500">
                    Reviewed: {new Date(request.reviewed_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                  </p>
                )}

                {request.paid_at && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Paid: {new Date(request.paid_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        A submitted request is pending administrator review. Approval does
        not mean money has been transferred. A request should only be marked
        paid after an actual transfer has been completed and its genuine
        payment reference has been recorded.
      </section>
    </Shell>
  );
}
