
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";

const wallets = [
  {
    name: "Main Balance",
    amount: "₦—",
    description: "Your funds for purchasing investment plans.",
    color: "border-emerald-200 bg-emerald-50",
  },
  {
    name: "Task Balance",
    amount: "₦—",
    description: "Your eligible task earnings and withdrawal funds.",
    color: "border-amber-200 bg-amber-50",
  },
  {
    name: "Affiliate Balance",
    amount: "₦—",
    description: "Your eligible referral commissions.",
    color: "border-blue-200 bg-blue-50",
  },
];

export default function Wallet() {
  return (
    <Shell>
      <PageTitle
        title="My Wallet"
        subtitle="Your money, organised into three separate balances."
      />

      <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#08291c] to-[#10432d] p-6 text-white shadow-xl">
        <p className="text-sm text-emerald-100">WEALTHORA WALLET</p>
        <h2 className="mt-3 text-2xl font-extrabold">
          Manage your balances
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-100/80">
          View your funds, track earnings and manage eligible withdrawal requests securely.
        </p>
        <Link
          href="/deposit"
          className="mt-5 inline-block rounded-xl bg-white px-6 py-3 font-bold text-[#0b2118]"
        >
          + Deposit Funds
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {wallets.map((wallet) => (
          <section
            key={wallet.name}
            className={`rounded-2xl border p-5 shadow-sm ${wallet.color}`}
          >
            <p className="text-sm font-bold text-slate-700">
              {wallet.name}
            </p>
            <p className="mt-5 text-3xl font-extrabold text-[#0b2118]">
              {wallet.amount}
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
          Main Balance is used to purchase WEALTHORA investment plans. Task Balance and Affiliate Balance cannot be substituted for it.
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
          Withdrawal requests open every 30th of the month, from 8:50 PM to 10:20 PM Nigeria time.
        </p>
        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">
            Admin review process
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Submitted requests remain Pending.</li>
            <li>Admins can approve or reject requests.</li>
            <li>Rejected amounts are refunded to Task Balance.</li>
            <li>Approved requests may take up to 3 days to process.</li>
          </ul>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0b2118]">
          Wallet activity
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Your verified deposits, transfers, earnings and withdrawals will appear here.
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
