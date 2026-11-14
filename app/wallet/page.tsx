
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

type BalanceType = "main" | "task" | "affiliate";

const walletInfo: {
  type: BalanceType;
  name: string;
  description: string;
}[] = [
  {
    type: "main",
    name: "Main Balance",
    description: "Used for eligible investment plan purchases. It is not withdrawable.",
  },
  {
    type: "task",
    name: "Task Balance",
    description: "Your eligible task earnings and withdrawal funds.",
  },
  {
    type: "affiliate",
    name: "Affiliate Balance",
    description: "Your eligible referral commissions.",
  },
];

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const dynamic = "force-dynamic";

export default async function Wallet() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const balances: Record<BalanceType, number> = {
    main: 0,
    task: 0,
    affiliate: 0,
  };

  let walletError = "";

  if (user) {
    const { data: accounts, error: accountError } = await supabase
      .from("ledger_accounts")
      .select("id, balance_type")
      .eq("user_id", user.id)
      .eq("currency", "NGN");

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
        const accountTypes = new Map(
          accounts.map((account) => [account.id, account.balance_type])
        );

        for (const entry of entries ?? []) {
          const type = accountTypes.get(entry.account_id) as BalanceType;

          if (!type || !(type in balances)) continue;

          const amount = Number(entry.amount);
          if (!Number.isFinite(amount)) continue;

          if (entry.entry_type === "credit") {
            balances[type] += amount;
          } else if (entry.entry_type === "debit") {
            balances[type] -= amount;
          }
        }
      }
    }
  }

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold tracking-widest text-blue-100">
            WEALTHORA WALLET
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">
            My Wallet
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50">
            View your recorded balances and track your wallet activity.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/deposit"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-sm"
            >
              Deposit
            </Link>
            <Link
              href="/withdraw"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white"
            >
              Withdrawal options
            </Link>
          </div>
        </section>

        {!user && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Please sign in to view your wallet.
          </div>
        )}

        {walletError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {walletError}
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-[#092b79]">
              Your balances
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Calculated from your posted NGN ledger transactions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {walletInfo.map((wallet) => (
              <article
                key={wallet.type}
                className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-600">
                    {wallet.name}
                  </p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    NGN
                  </span>
                </div>

                <p className="mt-5 break-words text-2xl font-extrabold text-[#092b79] sm:text-3xl">
                  {walletError ? "Unavailable" : money.format(balances[wallet.type])}
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {wallet.description}
                </p>

                {wallet.type === "main" && (
                  <Link
                    href="/invest"
                    className="mt-5 inline-block text-sm font-bold text-blue-700 underline"
                  >
                    View plan information
                  </Link>
                )}

                {wallet.type !== "main" && (
                  <Link
                    href="/withdraw"
                    className="mt-5 inline-block text-sm font-bold text-blue-700 underline"
                  >
                    View withdrawal options
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-extrabold text-amber-950">
            Task Balance withdrawals
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            The scheduled withdrawal window is the 30th of each month,
            from 8:50 PM to 10:20 PM Nigeria time.
          </p>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-lg font-extrabold text-[#092b79]">
            Affiliate Balance withdrawals
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            The scheduled withdrawal window is daily from 8:40 AM to
            10:00 AM Nigeria time. Eligibility requires at least one
            successful completed deposit or investment plan purchase
            in the account history.
          </p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-[#092b79]">
                Wallet activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review your recorded account transactions.
              </p>
            </div>
            <Link
              href="/transactions"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800"
            >
              View history
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-5">
          <h2 className="font-bold text-[#092b79]">
            Your security matters
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Balances shown here are read from posted ledger entries.
            This page does not create deposits, withdrawals or balance changes.
          </p>
        </section>

        <footer className="pb-5 text-center text-xs text-slate-400">
          WEALTHORA · Your wallet
        </footer>
      </main>
    </DashboardShell>
  );
        }
