
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";
import { plans, planDisclosure } from "@/lib/plans";

export default function Invest() {
  return (
    <Shell>
      <PageTitle
        title="Investment Centre"
        subtitle="Explore WEALTHORA investment opportunities and proposed plan terms."
      />

      <section className="mb-6 overflow-hidden rounded-3xl border border-[#31583a] bg-gradient-to-br from-[#103923] via-[#0b2819] to-[#07130b] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold tracking-[0.2em] text-[#b7ff35]">
          WEALTHORA INVESTMENTS
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">Choose your plan</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-gray-300">
          Every plan has its own two separate proposed daily tasks.
        </p>
        <div className="mt-6 rounded-2xl border border-[#456b45] bg-black/20 p-4">
          <p className="text-sm font-bold text-white">Your Main Balance</p>
          <p className="mt-1 text-xs leading-5 text-gray-300">
            Investment purchases are intended to use Main Balance only.
            Task Balance and Affiliate Balance cannot be used for plan purchases.
          </p>
        </div>
        <Link href="/wallet" className="mt-5 inline-block rounded-xl bg-[#b7ff35] px-6 py-3 font-bold text-[#071b10]">
          View Main Balance
        </Link>
      </section>

      <section className="mb-6 rounded-2xl border border-amber-400/40 bg-[#211b0b] p-5 text-white">
        <p className="text-sm font-extrabold text-amber-300">Important investment information</p>
        <p className="mt-3 text-sm leading-7 text-amber-100/80">{planDisclosure}</p>
        <p className="mt-3 text-sm leading-7 text-amber-100/80">
          Task amounts and 30-day totals are illustrations only, not guaranteed income or promised returns. Actual investment terms, risks and payment arrangements require the necessary approvals.
        </p>
        <p className="mt-3 text-xs font-bold text-amber-300">
          INVESTMENT PURCHASES ARE CURRENTLY DISABLED.
        </p>
      </section>

      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-white">Available plan proposals</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Review each plan's two tasks and illustrative 30-day total.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative overflow-hidden rounded-3xl border bg-[#0c1710] p-6 text-white shadow-lg ${
              plan.id === "popular"
                ? "border-[#b7ff35] ring-1 ring-[#b7ff35]/30"
                : "border-[#29432e]"
            }`}
          >
            {plan.id === "popular" && (
              <span className="absolute right-0 top-0 rounded-bl-xl bg-[#b7ff35] px-4 py-2 text-xs font-extrabold text-[#071b10]">
                POPULAR
              </span>
            )}

            <p className="text-xs font-bold tracking-[0.2em] text-[#b7ff35]">WEALTHORA PLAN</p>
            <h3 className="mt-4 text-2xl font-extrabold">{plan.name}</h3>

            <p className="mt-6 text-xs font-bold tracking-wider text-gray-400">PROPOSED CAPITAL</p>
            <p className="mt-2 text-3xl font-extrabold text-white">
              ₦{plan.capital.toLocaleString("en-NG")}
            </p>

            <div className="my-6 space-y-4 border-y border-[#29432e] py-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-400">Duration</span>
                <strong className="text-sm text-white">{plan.days} days</strong>
              </div>

              <div>
                <p className="mb-3 text-sm font-bold text-[#b7ff35]">
                  This plan's two separate daily tasks
                </p>
                <div className="space-y-3">
                  {plan.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#29432e] bg-black/20 px-4 py-3">
                      <span className="text-sm text-gray-300">{task.name}</span>
                      <strong className="text-sm text-white">
                        ₦{task.amount.toLocaleString("en-NG")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-400">Combined proposed daily task figure</span>
                <strong className="text-sm text-white">
                  ₦{plan.dailyTaskFigure.toLocaleString("en-NG")}
                </strong>
              </div>

              <div className="rounded-xl border border-[#456b45] bg-[#102719] p-4">
                <p className="text-xs font-bold text-gray-300">ILLUSTRATIVE 30-DAY TASK TOTAL</p>
                <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
                  ₦{(plan.dailyTaskFigure * plan.days).toLocaleString("en-NG")}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Daily task figure multiplied by {plan.days} days; not guaranteed income or a promised return.
                </p>
              </div>
            </div>

            <p className="mb-5 text-xs leading-6 text-gray-400">
              These are draft proposals only. Final terms, eligibility and operation require the necessary approvals.
            </p>

            <button type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-[#526052] bg-[#1b291e] px-4 py-4 text-sm font-bold text-gray-400">
              Purchases not yet enabled
            </button>
          </article>
        ))}
      </div>

      <section className="mt-7 rounded-2xl border border-[#29432e] bg-[#0c1710] p-5 text-white">
        <h2 className="text-lg font-extrabold">How plan purchases will work</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-gray-300">
          <li>Customer reviews the approved investment terms and risks.</li>
          <li>The system checks the available Main Balance.</li>
          <li>Customer confirms the investment purchase.</li>
          <li>The secure financial ledger records the transaction.</li>
          <li>Customer receives a transaction confirmation.</li>
        </ol>
      </section>

      <footer className="py-8 text-center text-xs text-gray-500">
        WEALTHORA · Building wealth with trust
      </footer>
    </Shell>
  );
                      }
