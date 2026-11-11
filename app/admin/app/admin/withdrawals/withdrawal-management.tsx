
"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number | string;
  balance_type: "task" | "affiliate";
  bank_name: string;
  account_name: string;
  status: "pending" | "approved" | "rejected" | "paid";
  refund_entry_id: string | null;
  reviewed_by: string | null;
  requested_at: string;
  reviewed_at: string | null;
  paid_at: string | null;
};

type Props = {
  currentUserId: string;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export default function WithdrawalManagement({
  currentUserId,
}: Props) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payoutReferences, setPayoutReferences] = useState<
    Record<string, string>
  >({});

  const loadRequests = useCallback(async () => {
    setError("");

    const { data, error: loadError } = await supabase
      .from("withdrawal_requests")
      .select(
        "id,user_id,amount,balance_type,bank_name,account_name,status,refund_entry_id,reviewed_by,requested_at,reviewed_at,paid_at"
      )
      .order("requested_at", { ascending: false })
      .limit(100);

    if (loadError) {
      setError("Unable to load withdrawal requests. Please refresh.");
    } else {
      setRequests((data ?? []) as Withdrawal[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void currentUserId;
    loadRequests();
  }, [currentUserId, loadRequests]);

  async function runAction(
    requestId: string,
    action: "approve" | "reject" | "paid"
  ) {
    setError("");
    setSuccess("");
    setProcessing(requestId);

    try {
      let rpcName = "";
      let rpcArgs: Record<string, string> = {};

      if (action === "approve") {
        rpcName = "approve_withdrawal_secure";
        rpcArgs = { p_request_id: requestId };
      }

      if (action === "reject") {
        rpcName = "reject_withdrawal_secure";
        rpcArgs = { p_request_id: requestId };
      }

      if (action === "paid") {
        const reference = payoutReferences[requestId]?.trim();

        if (!reference || reference.length < 3) {
          setError("Enter a valid payment provider reference first.");
          setProcessing("");
          return;
        }

        rpcName = "mark_withdrawal_paid_secure";
        rpcArgs = {
          p_request_id: requestId,
          p_payout_reference: reference,
        };
      }

      const { data, error: rpcError } = await supabase.rpc(
        rpcName,
        rpcArgs
      );

      if (rpcError) {
        setError("The action failed. Please check your access and try again.");
        return;
      }

      const result = data as {
        ok?: boolean;
        code?: string;
        message?: string;
      };

      if (result?.ok === false) {
        setError(
          result.message ??
            result.code ??
            "The withdrawal action could not be completed."
        );
        return;
      }

      setSuccess(
        action === "approve"
          ? "Withdrawal request approved."
          : action === "reject"
            ? "Withdrawal rejected. The refund is handled by the secure database function."
            : "Payment recorded successfully."
      );

      if (action === "paid") {
        setPayoutReferences((previous) => {
          const updated = { ...previous };
          delete updated[requestId];
          return updated;
        });
      }

      await loadRequests();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing("");
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-extrabold text-amber-950">
          Important payment instruction
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-900">
          Approving a request does not send money. Only mark a request
          as paid after the actual bank transfer has been completed
          through an authorized payment channel and you have its
          genuine payment reference.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#0b2118]">
            Customer withdrawal requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage submitted requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          Refresh
        </button>
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

      {loading ? (
        <p className="rounded-xl bg-white p-5 text-sm text-slate-500">
          Loading withdrawal requests...
        </p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h3 className="font-bold text-slate-800">
            No withdrawal requests yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Customer requests will appear here when submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#0b2118]">
                    {request.balance_type === "task"
                      ? "Task Balance"
                      : "Affiliate Balance"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Request ID: {request.id}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                  {request.status}
                </span>
              </div>

              <p className="mt-5 text-2xl font-extrabold text-[#0b2118]">
                {money.format(Number(request.amount))}
              </p>

              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                <p>
                  <strong>Customer ID:</strong> {request.user_id}
                </p>
                <p>
                  <strong>Bank:</strong> {request.bank_name}
                </p>
                <p>
                  <strong>Account name:</strong> {request.account_name}
                </p>
                <p>
                  <strong>Requested:</strong>{" "}
                  {new Date(request.requested_at).toLocaleString("en-NG")}
                </p>
                {request.reviewed_at && (
                  <p>
                    <strong>Reviewed:</strong>{" "}
                    {new Date(request.reviewed_at).toLocaleString("en-NG")}
                  </p>
                )}
                {request.paid_at && (
                  <p>
                    <strong>Paid:</strong>{" "}
                    {new Date(request.paid_at).toLocaleString("en-NG")}
                  </p>
                )}
              </div>

              {request.status === "pending" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={processing === request.id}
                    onClick={() => runAction(request.id, "approve")}
                    className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {processing === request.id
                      ? "Processing..."
                      : "Approve request"}
                  </button>

                  <button
                    type="button"
                    disabled={processing === request.id}
                    onClick={() => runAction(request.id, "reject")}
                    className="rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    Reject and refund
                  </button>
                </div>
              )}

              {request.status === "approved" && (
                <div className="mt-5 space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Actual payment provider reference
                  </label>

                  <input
                    type="text"
                    value={payoutReferences[request.id] ?? ""}
                    onChange={(event) =>
                      setPayoutReferences((previous) => ({
                        ...previous,
                        [request.id]: event.target.value,
                      }))
                    }
                    placeholder="Enter genuine transfer reference"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
                  />

                  <button
                    type="button"
                    disabled={processing === request.id}
                    onClick={() => runAction(request.id, "paid")}
                    className="w-full rounded-xl bg-[#0b2118] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {processing === request.id
                      ? "Processing..."
                      : "Record completed payment"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
            }
          
