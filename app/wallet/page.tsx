
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";

type BalanceType = "main" | "task" | "affiliate";

const walletInfo: {
  type: BalanceType;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    type: "main",
    name: "Main Balance",
    description: "Your funds for purchasing investment plans.",
    color: "border-emerald-200 bg-emerald-50",
  },
  {
    type: "task",
    name: "Task Balance",
    description: "Your eligible task earnings and withdrawal funds.",
    color: "border-amber-200 bg-amber-50",
  },
  {
    type: "affiliate",
    name: "Affiliate Balance",
    description: "Your eligible referral commissions.",
    color: "border-blue-200 bg-blue-50",
  },
];

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export const dynamic = "force-dynamic";

export default async function Wallet() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let balances: Record<BalanceType, number> = {
    main: 0,
    task: 0,
    affiliate: 0,
  };

  let walletError = "";

  if (user) {
    const { data: accounts, error: accountError } = await supabase
      .from("ledger_accounts")
      .select("id, balance_type")
      .eq("user_id", user.id);

    if (accountError) {
      walletError = "Unable to load your wallet accounts. Please refresh.";
    } else if (accounts && accounts.length > 0) {
      const accountIds = accounts.map((account) => account.id);

      const { data: entries, error: entriesError } = await supabase
        .from("ledger_entries")
        .select("account_id, entry_type, amount")
        .in("account_id", accountIds)
        .eq("status", "posted");

      if (entriesError) {
        walletError = "Unable to load your wallet transactions. Please refresh.";
      } else {
        for (const entry of entries ?? []) {
          const account = accounts.find(
            (item) => item.id === entry.account_id
          );

          if (!account) continue;

          const type = account.balance_type as BalanceType;
          if (!(type in balances)) continue;

          const amount = Number(entry.amount);
          if (!Number.isFinite(amount)) continue;

          balances[type] +=
            entry.entry_type === "credit" ? amount : -amount;
        }
      }
    }
  }

  return (
    <Shell>
      <PageTitle
        title="My Wallet"
        subtitle="Your balances are calculated from your posted ledger transactions."
      />

      {!user && (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Please sign in to view your wallet.
        </div>
      )}

      {walletError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {walletError}
        </div>
      )}

      <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#08291c] to-[#10432d] p-6 text-white shadow-xl">
        <p className="text-sm text-emerald-100">WEALTHORA WALLET</p>

        <h2 className="mt-3 text-2xl font-extrabold">
          Manage your balances
        </h2>

        <p className="mt-2 text-sm leading-6 text-emerald-100/80">
          View your recorded balances and track your wallet activity.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/deposit"
            className="inline-block rounded-xl bg-white px-6 py-3 font-bold text-[#0b2118]"
          >
            + Deposit Funds
          </Link>

          <Link
            href="/withdraw"
            className="inline-block rounded-xl bg-[#b7ff35] px-6 py-3 font-bold text-[#071b10]"
          >
            Withdraw Funds
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {walletInfo.map((wallet) => (
          <section
            key={wallet.type}
            className={`rounded-2xl border p-5 shadow-sm ${wallet.color}`}
          >
            <p className="text-sm font-bold text-slate-700">
              {wallet.name}
            </p>

            <p className="mt-5 break-words text-3xl font-extrabold text-[#0b2118]">
              {money.format(balances[wallet.type])}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-600">
              {wallet.description}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#0b2118]">
          Main Balance
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Main Balance is used to purchase WEALTHORA investment plans.
          Task Balance and Affiliate Balance cannot be substituted for it.
        </p>

        <Link
          href="/invest"
          className="mt-5 inline-block rounded-xl bg-[#0b2118] px-5 py-3 text-sm font-bold text-white"
        >
          Explore investment plans
        </Link>
      </section>

      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-bold text-[#0b2118]">
          Task Balance withdrawals
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Withdrawal requests open every 30th of the month, from 8:50 PM
          to 10:20 PM Nigeria time.
        </p>

        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">
            Admin review process
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Submitted requests remain Pending.</li>
            <li>Admins can approve or reject requests.</li>
            <li>Rejected amounts must be refunded exactly once.</li>
            <li>Approval does not mean payment has been made.</li>
          </ul>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-lg font-bold text-[#0b2118]">
          Affiliate Balance withdrawals
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Affiliate withdrawals are available daily from 8:40 AM to
          10:00 AM Nigeria time. You must have at least one approved
          deposit or successfully completed investment purchase in
          your account history.
        </p>

        <Link
          href="/withdraw"
          className="mt-4 inline-block rounded-xl bg-[#0b2118] px-5 py-3 text-sm font-bold text-white"
        >
          Request withdrawal
        </Link>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0b2118]">Wallet activity</h2>

        <p className="mt-2 text-sm text-slate-500">
          Your posted ledger transactions determine the balances shown above.
        </p>

        <Link
          href="/transactions"
          className="mt-4 inline-block text-sm font-bold text-emerald-800 underline"
        >
          View transaction history
        </Link>
      </section>
    </Shell>
  );
        }
        
