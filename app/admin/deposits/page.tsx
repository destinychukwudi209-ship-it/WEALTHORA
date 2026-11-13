
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function AdminDepositsPage() {
  const { supabase, profile } = await requireAdmin();

  if (
    !["admin", "super_admin"].includes(profile.role) ||
    profile.status !== "active"
  ) {
    redirect("/dashboard");
  }

  const { data: deposits, error } = await supabase
    .from("deposit_requests")
    .select(
      "id, user_id, amount, payment_reference, proof_url, status, created_at, reviewed_at, admin_note"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const depositsWithReceipts = await Promise.all(
    (deposits || []).map(async (deposit) => {
      let receiptUrl: string | null = null;

      if (deposit.proof_url) {
        const { data } = await supabase.storage
          .from("deposit-proofs")
          .createSignedUrl(deposit.proof_url, 300);

        receiptUrl = data?.signedUrl || null;
      }

      return { ...deposit, receiptUrl };
    })
  );

  return (
    <Shell>
      <PageTitle
        title="Deposit Review"
        subtitle="Review customer deposit submissions and securely inspect uploaded receipts."
      />

      <div className="panel mb-5">
        <h2 className="font-semibold">Read-only review</h2>
        <p className="muted text-sm mt-2">
          This page allows authorized administrators to inspect submitted
          deposits. It does not approve payments or credit customer balances.
        </p>
      </div>

      {error ? (
        <div className="panel text-red-500">
          Unable to load deposit requests. Please refresh and try again.
        </div>
      ) : depositsWithReceipts.length === 0 ? (
        <div className="panel">
          <h2 className="font-semibold">No deposit requests yet</h2>
          <p className="muted text-sm mt-2">
            Customer deposit submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {depositsWithReceipts.map((deposit) => (
            <div className="panel" key={deposit.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <h2 className="font-bold text-lg">
                  ₦{Number(deposit.amount).toLocaleString("en-NG")}
                </h2>

                <span className="text-sm font-semibold capitalize">
                  {deposit.status}
                </span>
              </div>

              <p className="muted text-xs mt-3">Deposit ID</p>
              <p className="text-sm break-all">{deposit.id}</p>

              <p className="muted text-xs mt-3">Customer ID</p>
              <p className="text-sm break-all">{deposit.user_id}</p>

              <p className="muted text-xs mt-3">Payment reference</p>
              <p className="text-sm break-all">
                {deposit.payment_reference || "Not provided"}
              </p>

              <p className="muted text-xs mt-3">Submitted</p>
              <p className="text-sm">
                {new Date(deposit.created_at).toLocaleString("en-NG")}
              </p>

              <p className="muted text-xs mt-3">Payment receipt</p>

              {deposit.receiptUrl ? (
                <a
                  href={deposit.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block mt-2"
                >
                  View receipt
                </a>
              ) : (
                <p className="text-sm text-amber-500">
                  Receipt unavailable or signed link could not be created.
                </p>
              )}

              {deposit.admin_note && (
                <p className="muted text-sm mt-3">
                  Admin note: {deposit.admin_note}
                </p>
              )}

              {deposit.reviewed_at && (
                <p className="muted text-xs mt-3">
                  Reviewed:{" "}
                  {new Date(deposit.reviewed_at).toLocaleString("en-NG")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
        }
              
