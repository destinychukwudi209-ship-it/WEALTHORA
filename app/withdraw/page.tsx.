
"use client";

import { useEffect, useState, type FormEvent } from "react";
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

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const messages: Record<string, string> = {
  unauthenticated: "Please sign in before requesting a withdrawal.",
  invalid_balance_type: "Choose a valid withdrawal wallet.",
  invalid_amount: "Enter a valid withdrawal amount.",
  invalid_bank_details: "Check your bank name, account name and 10-digit account number.",
  invalid_pin: "Your transaction PIN must contain six digits.",
  invalid_request_key: "Please try submitting again.",
  withdrawals_disabled: "Withdrawal requests are temporarily unavailable.",
  account_not_eligible: "Your account is not currently eligible for withdrawals.",
  email_not_verified: "Please verify your email address first.",
  task_withdrawal_window_closed: "Task Balance withdrawals open on the 30th, from 8:50 PM to 10:20 PM Nigeria time.",
  affiliate_withdrawal_window_closed: "Affiliate withdrawals open daily from 8:40 AM to 10:00 AM Nigeria time.",
  affiliate_eligibility_required: "You need at least one approved deposit or successfully completed investment purchase in your account history to withdraw Affiliate Balance.",
  locked: "Your transaction PIN is locked for 15 minutes after repeated incorrect attempts.",
  incorrect_pin: "Incorrect transaction PIN. Please try again.",
  pin_not_set: "Please set your transaction PIN in Settings before withdrawing.",
  wallet_not_found: "Your withdrawal wallet could not be found.",
  insufficient_balance: "Your available balance is insufficient.",
  duplicate_request: "This withdrawal request has already been submitted.",
};

export default function WithdrawPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [balanceType, setBalanceType] =
    useState<BalanceType>("task");

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");

  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadRequests() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in to use withdrawals.");
      setLoading(false);
      return;
    }

    const { data, error: requestError } = await supabase
      .from("withdrawal_requests")
      .select(
        "id, amount, balance_type, status, requested_at, reviewed_at, paid_at"
      )
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .limit(20);

    if (requestError) {
      setError("Unable to load withdrawal history. Please refresh.");
    } else {
      setRequests((data ?? []) as Withdrawal[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function submitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (!/^[0-9]{10}$/.test(accountNumber)) {
      setError("Enter a valid 10-digit bank account number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(pin)) {
      setError("Enter your six-digit transaction PIN.");
      return;
    }

    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();

      const { data, error: rpcError } = await supabase.rpc(
        "request_withdrawal_secure",
        {
          p_balance_type: balanceType,
          p_amount: parsedAmount,
          p_bank_name: bankName.trim(),
          p_account_name: accountName.trim(),
          p_bank_account_number: accountNumber,
          p_pin: pin,
          p_idempotency_key: idempotencyKey,
        }
      );

      if (rpcError) {
        setError("Unable to submit your request. Please try again.");
        return;
      }

      const result = data as {
        ok?: boolean;
        code?: string;
        request_id?: string;
        status?: string;
      };

      if (!result?.ok) {
        setError(
          messages[result?.code ?? ""] ??
            "Your withdrawal request could not be completed."
        );
        return;
      }

      setSuccess(
        "Your withdrawal request has been submitted and is awaiting administrator review."
      );

      setAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setPin("");

      await loadRequests();
    } catch {
      setError("Something went wrong. Please try again.");
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

      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
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
          All withdrawal times follow Nigeria time. Requests are subject
          to account eligibility, available balance and administrator review.
        </p>
      </div>

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
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Bank name
          </label>

          <input
            type="text"
            required
            maxLength={100}
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
            maxLength={120}
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
            required
            value={accountNumber}
            onChange={(event) =>
              setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="0123456789"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Six-digit transaction PIN
          </label>

          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
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
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#0b2118] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting request..." : "Submit withdrawal request"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Your bank account number is encrypted before it is stored.
          Your PIN is checked securely by the database and is not saved
          by this page.
        </p>
      </form>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#0b2118]">
          Withdrawal history
        </h2>

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
                    {request.status}
                  </span>
                </div>

                <p className="mt-3 text-xl font-extrabold text-[#0b2118]">
                  {money.format(Number(request.amount))}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Requested:{" "}
                  {new Date(request.requested_at).toLocaleString("en-NG")}
                </p>

                {request.paid_at && (
                  <p className="mt-1 text-xs text-emerald-700">
                    Paid: {new Date(request.paid_at).toLocaleString("en-NG")}
                  </p>
                )}

                {request.reviewed_at && (
                  <p className="mt-1 text-xs text-slate-500">
                    Reviewed: {new Date(request.reviewed_at).toLocaleString("en-NG")}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
