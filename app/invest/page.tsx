
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";
import { plans, planDisclosure } from "@/lib/plans";

export default function Invest() {
  return (
    <Shell>
      <PageTitle
        title="Investment Centre"
        subtitle="Explore WEALTHORA investment plan options."
      />

      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#08291c] to-[#10432d] p-5 text-white shadow-lg">
        <p className="text-xs font-semibold tracking-widest text-amber-300">
          WEALTHORA INVESTMENTS
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          Choose your plan
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-100/80">
          Investment plan purchases are intended to use Main Balance only.
          Task Balance and Affiliate Balance cannot be used to purchase plans.
        </p>
        <Link
          href="/wallet"
          className="mt-5 inline-block rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#10251b]"
        >
          View Main Balance
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">
          Important investment information
        </p>
        <p className="mt-2 text-xs leading-5 text-amber-900/80">
          {planDisclosure}
        </p>
        <p className="mt-2 text-xs leading-5 text-amber-900/80">
          These figures are proposed product terms, not guaranteed earnings.
          Purchases remain unavailable until the product terms, legal
          requirements and secure payment system have been approved.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-lg ${
              plan.id === "popular"
                ? "border-amber-400 ring-1 ring-amber-300"
                : "border-slate-200"
            }`}
          >
            {plan.id === "popular" && (
              <span className="absolute right-0 top-0 rounded-bl-xl bg-amber-400 px-3 py-2 text-[10px] font-extrabold tracking-wider text-[#10251b]">
                POPULAR
              </span>
            )}

            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              WEALTHORA PLAN
            </p>

            <h2 className="mt-3 text-2xl font-extrabold text-[#0b2118]">
              {plan.name}
            </h2>

            <p className="mt-5 text-xs font-semibold text-slate-500">
              PROPOSED CAPITAL
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0b2118]">
              ₦{plan.capital.toLocaleString("en-NG")}
            </p>

            <div className="my-5 space-y-3 border-y border-slate-100 py-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Duration</span>
                <strong className="text-slate-800">
                  {plan.days} days
                </strong>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Proposed daily task figure
                </span>
                <strong className="text-slate-800">
                  ₦{plan.dailyTaskFigure.toLocaleString("en-NG")}
                </strong>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Illustrative projected value
                </span>
                <strong className="text-slate-800">
                  ₦{plan.projectedValue.toLocaleString("en-NG")}
                </strong>
              </div>
            </div>

            <p className="mb-4 text-xs leading-5 text-slate-500">
              Proposed figures only. Actual terms and eligibility require
              approval and must be disclosed before any purchase.
            </p>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
            >
              Purchases not yet enabled
            </button>
          </article>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0b2118]">
          How plan purchases will work
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
          <li>Customer reviews the approved plan terms.</li>
          <li>System checks the customer's available Main Balance.</li>
          <li>Customer confirms the purchase.</li>
          <li>Server securely records the debit and investment transaction.</li>
          <li>Customer receives a transaction confirmation.</li>
        </ol>
      </div>
    </Shell>
  );
          }
