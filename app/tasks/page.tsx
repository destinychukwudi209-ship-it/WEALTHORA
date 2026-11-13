
import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/plans";

export const dynamic = "force-dynamic";

type Purchase = {
  id: string;
  plan_id: string;
  plan_name: string;
  duration_days: number;
  created_at: string;
  completed_at: string | null;
  status: string;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <PageTitle
          title="My Tasks"
          subtitle="Tasks are available only to customers with an active investment plan."
        />
        <p className="rounded-2xl border border-amber-400/30 bg-[#211b0b] p-5 text-amber-100">
          Please sign in to check your investment eligibility.
          <Link href="/login" className="mt-4 block font-bold text-[#b7ff35] underline">
            Sign in
          </Link>
        </p>
      </Shell>
    );
  }

  const { data: purchases, error } = await supabase
    .from("investment_purchases")
    .select("id, plan_id, plan_name, duration_days, created_at, completed_at, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("completed_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Shell>
        <PageTitle title="My Tasks" subtitle="Your plan-linked task centre." />
        <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-red-200">
          We couldn't verify your active investment plans. No tasks are being shown. Please refresh or contact support.
        </p>
      </Shell>
    );
  }

  const now = Date.now();

  const activePurchases = ((purchases ?? []) as Purchase[]).filter((purchase) => {
    const startedAt = new Date(purchase.created_at).getTime();
    const expiresAt =
      startedAt + purchase.duration_days * 24 * 60 * 60 * 1000;

    return (
      Number.isFinite(startedAt) &&
      purchase.duration_days > 0 &&
      expiresAt > now
    );
  });

  return (
    <Shell>
      <PageTitle
        title="My Tasks"
        subtitle="Each active investment plan has its own separate Task 1 and Task 2."
      />

      {activePurchases.length === 0 ? (
        <section className="rounded-3xl border border-[#29432e] bg-[#0c1710] p-6 text-white">
          <div className="text-3xl">🔒</div>

          <h2 className="mt-4 text-xl font-extrabold">
            No active investment plan
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-300">
            Your task list is hidden because there is no active, unexpired
            investment plan on your account. When an eligible plan is active,
            its own tasks will appear here.
          </p>

          <Link
            href="/invest"
            className="mt-5 inline-block rounded-xl bg-[#b7ff35] px-5 py-3 text-sm font-extrabold text-[#071b10]"
          >
            View investment plans
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {activePurchases.map((purchase) => {
            const plan = plans.find(
              (item) => item.id === purchase.plan_id
            );

            if (!plan) return null;

            const expiresAt = new Date(
              new Date(purchase.created_at).getTime() +
              purchase.duration_days * 24 * 60 * 60 * 1000
            );

            return (
              <section
                key={purchase.id}
                className="rounded-3xl border border-[#31583a] bg-[#0c1710] p-5 text-white shadow-lg sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-[#b7ff35]">
                      ACTIVE INVESTMENT PLAN
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold">
                      {purchase.plan_name}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Purchase reference: {purchase.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    Active
                  </span>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  Plan ends:{" "}
                  {expiresAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {plan.tasks.map((task, index) => (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-[#29432e] bg-[#102319] p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-[#b7ff35]">
                        {task.name}
                      </p>

                      <h3 className="mt-2 text-lg font-extrabold">
                        {index === 0
                          ? "Visit WEALTHORA WhatsApp Community"
                          : "Visit WEALTHORA Telegram Channel"}
                      </h3>

                      <p className="mt-3 text-2xl font-extrabold text-white">
                        {money.format(task.amount)}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Proposed task amount. Not currently claimable.
                      </p>

                      <button
                        type="button"
                        disabled
                        className="mt-4 w-full cursor-not-allowed rounded-xl border border-[#526052] bg-[#1b291e] px-4 py-3 text-sm font-bold text-gray-400"
                      >
                        Claims not yet enabled
                      </button>
                    </article>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-gray-500">
                  Task claims are disabled while investment terms and the
                  secure claim process remain under review. A task amount
                  is not a guaranteed earning.
                </p>
              </section>
            );
          })}
        </div>
      )}

      <footer className="py-8 text-center text-xs text-gray-500">
        WEALTHORA · Building wealth with trust
      </footer>
    </Shell>
  );
    }
