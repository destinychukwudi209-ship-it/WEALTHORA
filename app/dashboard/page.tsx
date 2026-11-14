"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";

const moneyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Dashboard() {
  const [customerName, setCustomerName] = useState("there");
  const [amounts, setAmounts] = useState({
    main: "Loading...",
    task: "Loading...",
    affiliate: "Loading...",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadDashboard() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Please sign in again.");

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];

        if (name && active) setCustomerName(name);

        const { data: accounts, error: accountsError } = await supabase
          .from("ledger_accounts")
          .select("id, balance_type")
          .eq("user_id", user.id)
          .eq("currency", "NGN");

        if (accountsError) throw accountsError;

        const totals = {
          main: 0,
          task: 0,
          affiliate: 0,
        };

        const accountTypes: Record<string, string> = {};

        for (const account of accounts || []) {
          accountTypes[account.id] = account.balance_type;
        }

        const ids = (accounts || []).map((account) => account.id);

        if (ids.length > 0) {
          const { data: entries, error: entriesError } = await supabase
            .from("ledger_entries")
            .select("account_id, entry_type, amount")
            .in("account_id", ids)
            .eq("status", "posted");

          if (entriesError) throw entriesError;

          for (const entry of entries || []) {
            const type = accountTypes[entry.account_id];
            if (!(type in totals)) continue;

            const value = Number(entry.amount);
            if (!Number.isFinite(value)) continue;

            if (entry.entry_type === "credit") {
              totals[type as keyof typeof totals] += value;
            } else if (entry.entry_type === "debit") {
              totals[type as keyof typeof totals] -= value;
            }
          }
        }

        if (!active) return;

        setAmounts({
          main: moneyFormat.format(totals.main),
          task: moneyFormat.format(totals.task),
          affiliate: moneyFormat.format(totals.affiliate),
        });

        setError("");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your balances."
        );

        setAmounts({
          main: "Unavailable",
          task: "Unavailable",
          affiliate: "Unavailable",
        });
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell>
      <section className="rounded-3xl bg-gradient-to-r from-blue-100 via-blue-50 to-sky-100 p-5">
        <p className="text-sm font-semibold text-blue-700">
          Welcome back,
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#092b79]">
          {customerName}!
        </h1>
        <p className="mt-2 text-sm text-blue-800">
          Your WEALTHORA account at a glance.
        </p>
      </section>

      <section className="mt-5 rounded-[28px] bg-gradient-to-br from-[#5420b9] via-[#7029dc] to-[#8a3df1] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-purple-100">
                Available Balance
              </p>
              <Link
                href="/deposit"
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold"
              >
                Deposit
              </Link>
              <span className="text-lg">◎</span>
            </div>

            <p className="mt-4 break-all text-3xl font-extrabold">
              {amounts.main}
            </p>
          </div>

          <Link
            href="/deposit"
            aria-label="Add money"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 text-3xl"
          >
            +
          </Link>
        </div>

        <div className="my-5 border-t border-dashed border-white/30" />

        <div className="grid grid-cols-3 gap-2">
          <Link href="/deposit" className="flex flex-col items-center gap-2 rounded-xl py-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl">＋</span>
            <span className="text-xs font-semibold">Add Money</span>
          </Link>

          <Link href="/withdraw" className="flex flex-col items-center gap-2 rounded-xl py-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl">↗</span>
            <span className="text-xs font-semibold">Withdraw</span>
          </Link>

          <Link href="/transactions" className="flex flex-col items-center gap-2 rounded-xl py-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl">◷</span>
            <span className="text-xs font-semibold">History</span>
          </Link>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/invest" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <span className="text-2xl text-blue-700">↗</span>
          <p className="mt-2 text-sm font-bold text-[#092b79]">Invest Now</p>
        </Link>

        <Link href="/referrals" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <span className="text-2xl text-blue-700">♧</span>
          <p className="mt-2 text-sm font-bold text-[#092b79]">Affiliate Centre</p>
        </Link>

        <Link href="/support" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <span className="text-2xl text-blue-700">◉</span>
          <p className="mt-2 text-sm font-bold text-[#092b79]">Get Support</p>
        </Link>

        <Link href="/profile" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <span className="text-2xl text-blue-700">◎</span>
          <p className="mt-2 text-sm font-bold text-[#092b79]">My Profile</p>
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-extrabold text-[#092b79]">
          My Balances
        </h2>

        <div className="grid gap-3">
          <Link href="/wallet" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Main Balance</p>
            <p className="mt-2 text-2xl font-extrabold text-[#092b79]">{amounts.main}</p>
            <p className="mt-1 text-xs text-slate-500">For investment plan purchases</p>
          </Link>

          <Link href="/wallet" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Task Balance</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">{amounts.task}</p>
            <p className="mt-1 text-xs text-slate-500">Your eligible task earnings</p>
          </Link>

          <Link href="/referrals" className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Affiliate Balance</p>
            <p className="mt-2 text-2xl font-extrabold text-purple-700">{amounts.affiliate}</p>
            <p className="mt-1 text-xs text-slate-500">Your eligible referral commissions</p>
          </Link>
        </div>
      </section>

      <Link href="/invest" className="mt-5 flex items-center justify-between rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs text-slate-500">Investment Plans</p>
          <h2 className="mt-1 text-lg font-extrabold text-[#092b79]">Explore Plans</h2>
          <p className="mt-1 text-xs text-slate-500">View available plan information</p>
        </div>
        <span className="text-3xl text-blue-700">♛</span>
      </Link>

      <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[#092b79]">Recent Activity</h2>
          <Link href="/transactions" className="text-sm font-bold text-blue-700">
            See All →
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          View your recorded account activity and transaction history.
        </p>
      </section>

      <section className="mt-5 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#092b79] to-[#0877e8] p-5 text-white">
        <span className="text-3xl">🛡️</span>
        <div>
          <h2 className="font-bold">Your Security Matters</h2>
          <p className="mt-1 text-xs text-blue-100">
            Never share your password or verification codes.
          </p>
        </div>
        <Link href="/settings" className="ml-auto text-xs font-bold underline">
          Settings
        </Link>
      </section>

      <footer className="py-7 text-center text-xs text-slate-400">
        WEALTHORA · Invest · Earn · Grow
      </footer>
    </DashboardShell>
  );
    }
