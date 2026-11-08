
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";

const balances = [
  {
    title: "Main Balance",
    amount: "₦—",
    description: "Available for investment plan purchases only",
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
      <div className="mb-8 overflow-hidden rounded-3xl border border-[#31583a] bg-gradient-to-br from-[#102d1b] via-[#0b2114] to-[#07100a] p-6 text-white shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs font-bold tracking-wider text-[#b7ff35]">
            CUSTOMER DASHBOARD
          </span>
          <span className="text-xs font-bold tracking-[0.2em] text-[#b7ff35]">
            WEALTHORA
          </span>
        </div>

        <p className="mt-8 text-sm text-gray-300">
          Welcome to your wealth overview
        </p>

        <h1 className="mt-2 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Your financial journey, all in one place.
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300">
          Manage your balances, follow your investments and keep track of your account activity.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/wallet"
            className="rounded-xl bg-[#b7ff35] px-5 py-3 text-sm font-extrabold text-[#071b10] transition hover:bg-lime-300"
          >
            Open my wallet
          </Link>

          <Link
            href="/invest"
            className="rounded-xl border border-[#55745a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
            className="group rounded-2xl border border-[#24452b] bg-[#0b170e] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-[#b7ff35]/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">
                {item.title}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#31583a] bg-[#173c25] text-xl text-[#b7ff35]">
                {item.icon}
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold tracking-tight text-white">
              {item.amount}
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
        <section className="rounded-2xl border border-[#24452b] bg-[#0b170e] p-5 shadow-lg shadow-black/20">
          <h2 className="text-lg font-bold text-white">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Get to the services you use most.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#24452b] bg-[#102319] p-4 transition hover:border-[#b7ff35]/60 hover:bg-[#173c25]"
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
            <p className="text-sm font-semibold text-white">
              How it works
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              Requests remain pending until an admin reviews them. Rejected requests are refunded to Task Balance. Approved requests may take up to 3 days to process.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#24452b] bg-[#0b170e] p-5 shadow-lg shadow-black/20">
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
