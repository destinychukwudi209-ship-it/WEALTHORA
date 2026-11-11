
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

const balanceCards = [
  {
    title: "Main Balance",
    key: "main",
    description: "Available for investment plan purchases only",
    icon: "◈",
    href: "/wallet",
  },
  {
    title: "Task Balance",
    key: "task",
    description: "Your eligible task earnings",
    icon: "✦",
    href: "/wallet",
  },
  {
    title: "Affiliate Balance",
    key: "affiliate",
    description: "Your eligible referral commissions",
    icon: "♧",
    href: "/referrals",
  },
];

const shortcuts = [
  { label: "My Wallet", detail: "Manage your balances", href: "/wallet", icon: "◈" },
  { label: "Investment Plans", detail: "Explore available plans", href: "/invest", icon: "↗" },
  { label: "Transactions", detail: "Review account activity", href: "/transactions", icon: "⇄" },
  { label: "Affiliate Centre", detail: "Track your referrals", href: "/referrals", icon: "♧" },
];

const moneyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Dashboard() {
  const [customerName, setCustomerName] = useState("there");
  const [amounts, setAmounts] = useState<Record<string, string>>({
    main: "Loading...",
    task: "Loading...",
    affiliate: "Loading...",
  });
  const [balanceError, setBalanceError] = useState("");

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

        if (!user) {
          throw new Error("Please sign in again to view your balances.");
        }

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

        if (!accounts || accounts.length === 0) {
          throw new Error("Your wallet accounts are not set up yet.");
        }

        const accountIds = accounts.map((account) => account.id);

        const { data: entries, error: entriesError } = await supabase
          .from("ledger_entries")
          .select("account_id, entry_type, amount")
          .in("account_id", accountIds)
          .eq("status", "posted");

        if (entriesError) throw entriesError;

        const totals: Record<string, number> = {
          main: 0,
          task: 0,
          affiliate: 0,
        };

        const accountTypes: Record<string, string> = {};

        for (const account of accounts) {
          accountTypes[account.id] = account.balance_type;
        }

        for (const entry of entries || []) {
          const type = accountTypes[entry.account_id];

          if (!type || !(type in totals)) continue;

          const value = Number(entry.amount);

          if (!Number.isFinite(value)) continue;

          if (entry.entry_type === "credit") {
            totals[type] += value;
          } else if (entry.entry_type === "debit") {
            totals[type] -= value;
          }
        }

        if (!active) return;

        setAmounts({
          main: moneyFormat.format(totals.main),
          task: moneyFormat.format(totals.task),
          affiliate: moneyFormat.format(totals.affiliate),
        });

        setBalanceError("");
      } catch (error) {
        if (!active) return;

        console.error("Dashboard loading error:", error);

        setBalanceError(
          error instanceof Error
            ? error.message
            : "Unable to load your balances. Please refresh."
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
    <Shell>
      <div className="mb-8 overflow-hidden rounded-3xl border border-[#31583a] bg-gradient-to-br from-[#102d1b] via-[#0b2114] to-[#07100a] p-6 text-white shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs font-bold tracking-wider text-[#b7ff35]">
            CUSTOMER DASHBOARD
          </span>
          <span className="text-xs font-bold tracking-[0.2em] text-[#b7ff35]">
            WEALTHORA
          </span>
        </div>

        <p className="mt-8 text-sm text-gray-300">Welcome to WEALTHORA</p>

        <h1 className="mt-2 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Welcome, {customerName}!
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300">
          Your financial journey starts here. Manage your balances, follow your investments and keep track of your account activity.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/wallet"
            className="rounded-xl bg-[#b7ff35] px-5 py-3 text-sm font-extrabold text-[#071b10]"
          >
            Open my wallet
          </Link>

          <Link
            href="/invest"
            className="rounded-xl border border-[#55745a] px-5 py-3 text-sm font-semibold text-white"
          >
            Explore plans
          </Link>
        </div>
      </div>

      <PageTitle
        title="Your balances"
        subtitle="Three separate balances for three different purposes."
      />

      {balanceError && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          Balance loading problem: {balanceError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {balanceCards.map((item) => (
          <Link
            href={item.href}
            key={item.title}
            className="group rounded-2xl border border-[#24452b] bg-[#0b170e] p-5 shadow-lg transition hover:border-[#b7ff35]/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">
                {item.title}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#31583a] bg-[#173c25] text-xl text-[#b7ff35]">
                {item.icon}
              </span>
            </div>

            <p className="mt-5 break-words text-3xl font-extrabold text-white">
              {amounts[item.key]}
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-400">
              {item.description}
            </p>

            <p className="mt-5 text-xs font-bold text-[#b7ff35]">
              View balance →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#24452b] bg-[#0b170e] p-5">
          <h2 className="text-lg font-bold text-white">Quick actions</h2>

          <p className="mt-1 text-sm text-gray-400">
            Get to the services you use most.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#24452b] bg-[#102319] p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#24452b] text-lg text-[#b7ff35]">
                  {item.icon}
                </span>

                <span>
                  <span className="block text-sm font-bold text-white">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {item.detail}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#42652f] bg-[#101f12] p-5">
          <h2 className="text-lg font-bold text-white">
            Task withdrawal schedule
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-300">
            Task Balance withdrawal requests are scheduled for the 30th of each month.
          </p>

          <div className="mt-5 rounded-xl border border-[#42652f] bg-[#09150c] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Monthly request window
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
              8:50 PM – 10:20 PM
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Nigeria time (WAT) · Every 30th
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-[#24452b] bg-[#0b170e] p-4">
            <p className="text-sm leading-6 text-gray-300">
              Dear {customerName}, please allow up to 3 working days for your approved withdrawal to be processed and credited to your bank account.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#24452b] bg-[#0b170e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Recent account activity
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Your latest verified financial transactions.
            </p>
          </div>

          <Link
            href="/transactions"
            className="text-sm font-bold text-[#b7ff35] underline"
          >
            View history
          </Link>
        </div>

        <div className="mt-5 rounded-xl border border-[#24452b] bg-[#09150c] p-6 text-center">
          <span className="text-3xl text-gray-500">⇄</span>
          <p className="mt-3 text-sm font-semibold text-white">
            No verified transactions to display
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Your account activity will appear here when connected to the financial ledger.
          </p>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-gray-500">
        WEALTHORA · Building wealth with trust
      </footer>
    </Shell>
  );
          }
      
