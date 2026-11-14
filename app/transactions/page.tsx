
import DashboardShell from "@/components/dashboard-shell";

export default function Transactions() {
  return (
    <DashboardShell>
      <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-lg">
        <p className="text-xs font-bold tracking-widest text-blue-100">
          WEALTHORA
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Transaction History
        </h1>
        <p className="mt-2 text-sm text-blue-50">
          Your deposits, withdrawals, investments, rewards and reversals.
        </p>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-blue-700">◷</span>
          <div>
            <h2 className="font-extrabold text-[#092b79]">
              Account Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your transaction records
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-center">
          <p className="font-semibold text-[#092b79]">
            No verified transactions to display.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Transaction records must be read from the immutable ledger,
            not client-entered values.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
