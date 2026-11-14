
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import { plans, planDisclosure } from "@/lib/plans";

export default function Invest() {
  return (
    <DashboardShell>
      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold tracking-widest text-blue-100">
          WEALTHORA INVESTMENTS
        </p>
        <h1 className="mt-4 text-3xl font-extrabold">
          Investment Centre
        </h1>
        <p className="mt-3 text-sm leading-7 text-blue-50">
          Explore the proposed WEALTHORA investment plans and their terms.
        </p>
        <Link
          href="/wallet"
          className="mt-5 inline-block rounded-xl bg-white px-6 py-3 font-bold text-blue-800"
        >
          View Main Balance
        </Link>
      </section>

      <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-sm font-extrabold text-amber-900">
          Important investment information
        </h2>
        <p className="mt-3 text-sm leading-7 text-amber-900">
          {planDisclosure}
        </p>
        <p className="mt-3 text-sm leading-7 text-amber-900">
          No return or earning is guaranteed by these proposed figures.
          Actual investment terms, risks and payment arrangements require
          appropriate approval before customers can invest.
        </p>
        <p className="mt-3 text-xs font-bold text-amber-800">
          INVESTMENT PURCHASES ARE CURRENTLY DISABLED.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-xl font-extrabold text-[#092b79]">
          Available plan proposals
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Review the proposed amounts and durations below.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative overflow-hidden rounded-3xl border bg-white p-6 text-[#10265c] shadow-sm ${
              plan.id === "popular"
                ? "border-blue-500 ring-1 ring-blue-200"
                : "border-blue-100"
            }`}
          >
            {plan.id === "popular" && (
              <span className="absolute right-0 top-0 rounded-bl-xl bg-blue-700 px-4 py-2 text-xs font-extrabold text-white">
                POPULAR
              </span>
            )}

            <p className="text-xs font-bold tracking-widest text-blue-700">
              WEALTHORA PLAN
            </p>

            <h3 className="mt-4 text-2xl font-extrabold">
              {plan.name}
            </h3>

            <p className="mt-6 text-xs font-bold tracking-wider text-slate-500">
              PROPOSED CAPITAL
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#092b79]">
              ₦{plan.capital.toLocaleString("en-NG")}
            </p>

            <div className="my-6 space-y-4 border-y border-blue-100 py-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">Duration</span>
                <strong className="text-sm">{plan.days} days</strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">
                  Proposed daily task figure
                </span>
                <strong className="text-sm">
                  ₦{plan.dailyTaskFigure.toLocaleString("en-NG")}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">
                  Illustrative projected value
                </span>
                <strong className="text-sm">
                  ₦{plan.projectedValue.toLocaleString("en-NG")}
                </strong>
              </div>
            </div>

            <p className="mb-5 text-xs leading-6 text-slate-500">
              These are proposed figures, not guaranteed earnings.
              Final terms and eligibility require approval.
            </p>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-400"
            >
              Purchases not yet enabled
            </button>
          </article>
        ))}
      </div>

      <section className="mt-7 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#092b79]">
          How plan purchases will work
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
          <li>Customer reviews the approved investment terms and risks.</li>
          <li>The system checks the available Main Balance.</li>
          <li>Customer confirms the investment purchase.</li>
          <li>The secure financial ledger records the transaction.</li>
          <li>Customer receives a transaction confirmation.</li>
        </ol>
      </section>

      <footer className="py-8 text-center text-xs text-slate-400">
        WEALTHORA · Building wealth with trust
      </footer>
    </DashboardShell>
  );
        }
