
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";

const balances = [
  {
    title: "Main Balance",
    amount: "₦—",
    description: "Available for investment plan purchases",
    icon: "◈",
    href: "/wallet",
  },
  {
    title: "Task Balance",
    amount: "₦—",
    description: "Your eligible task earnings",
    icon: "✦",
    href: "/wallet",
  },
  {
    title: "Affiliate Balance",
    amount: "₦—",
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

export default function Dashboard() {
  return (
    <Shell>
      <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#08291c] via-[#10432d] to-[#071b13] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            CUSTOMER DASHBOARD
          </span>
          <span className="text-xs tracking-widest text-amber-300">
            WEALTHORA
          </span>
        </div>

        <p className="mt-8 text-sm text-emerald-100/80">
          Welcome to your wealth overview
        </p>
        <h1 className="mt-2 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Your financial journey, all in one place.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/70">
          Manage your balances, follow your investments and keep track of your account activity.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/wallet"
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#10251b] hover:bg-amber-300"
          >
            Open my wallet
          </Link>
          <Link
            href="/invest"
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Explore plans
          </Link>
        </div>
      </div>

      <PageTitle
        title="Your balances"
        subtitle="Three separate balances for three different purposes."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {balances.map((item) => (
          <Link
            href={item.href}
            key={item.title}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                {item.title}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-800">
                {item.icon}
              </span>
            </div>
            <p className="mt-5 text-3xl font-extrabold tracking-tight text-[#0b2118]">
              {item.amount}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {item.description}
            </p>
            <p className="mt-5 text-xs font-bold text-emerald-800">
              View balance →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#0b2118]">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Get to the services you use most.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-lg text-emerald-900">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.detail}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-bold text-[#0b2118]">
            Task withdrawal schedule
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Task Balance withdrawal requests are scheduled for the 30th of each month.
          </p>

          <div className="mt-5 rounded-xl border border-amber-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly request window
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#0b2118]">
              8:50 PM – 10:20 PM
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Nigeria time (WAT) · Every 30th
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-800">
              How it works
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Requests remain pending until an admin reviews them. Rejected requests are refunded to Task Balance. Approved requests may take up to 3 days to process.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0b2118]">
              Recent account activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest verified financial transactions.
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-sm font-bold text-emerald-800 underline"
          >
            View history
          </Link>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
          <span className="text-3xl text-slate-300">⇄</span>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No verified transactions to display
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Your account activity will appear here when connected to the financial ledger.
          </p>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate-400">
        WEALTHORA · Building wealth with trust
      </footer>
    </Shell>
  );
          }
