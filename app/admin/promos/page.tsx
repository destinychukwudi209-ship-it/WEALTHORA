
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const { profile } = await requireAdmin();

  // Promo campaign creation is restricted to senior administrators.
  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/admin");
  }

  return (
    <Shell>
      <PageTitle
        title="Promo Campaigns"
        subtitle="Create promotional campaigns and monitor customer claims."
      />

      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
        <p className="font-bold text-amber-300">Campaign publishing is not connected yet</p>
        <p className="mt-2 text-sm leading-6 text-amber-100/80">
          This is the campaign management screen. Saving and publishing will
          be enabled after the secure database and redemption connection is
          completed.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total campaigns", "—"],
          ["Active campaigns", "—"],
          ["Total claims", "—"],
          ["Available claim slots", "—"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#24452b] bg-[#09170e] p-4"
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
              {value}
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              Awaiting database connection
            </p>
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-[#31583a] bg-[#09170e] p-4 sm:p-6">
        <h2 className="text-lg font-extrabold text-white">
          Create a campaign
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Set the reward, claim limit and campaign validity period.
        </p>

        <form className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Campaign name
            </label>
            <input
              disabled
              placeholder="Example: Welcome Bonus Campaign"
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Unique promo code
            </label>
            <input
              disabled
              placeholder="Example: WELCOME2026"
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 uppercase text-white placeholder:text-gray-500 disabled:opacity-70"
            />
            <p className="mt-1 text-xs text-gray-500">
              Each campaign will have a unique code.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Reward type
            </label>
            <select
              disabled
              defaultValue=""
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white disabled:opacity-70"
            >
              <option value="" disabled>
                Select reward type
              </option>
              <option value="discount">Percentage discount</option>
              <option value="bonus">Fixed bonus amount</option>
              <option value="plan_benefit">Extra investment-plan benefit</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Reward value or benefit details
            </label>
            <input
              disabled
              placeholder="Example: 10% or 5000 or benefit description"
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500 disabled:opacity-70"
            />
            <p className="mt-1 text-xs text-gray-500">
              The reward will be validated before it can affect any account
              balance or investment purchase.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Maximum number of claims
            </label>
            <input
              disabled
              type="number"
              min="1"
              placeholder="Example: 100"
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500 disabled:opacity-70"
            />
            <p className="mt-1 text-xs text-gray-500">
              The campaign will automatically stop accepting claims when
              this limit is reached.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Start date and time
              </label>
              <input
                disabled
                type="datetime-local"
                className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white disabled:opacity-70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                End date and time
              </label>
              <input
                disabled
                type="datetime-local"
                className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Initial campaign status
            </label>
            <select
              disabled
              defaultValue="paused"
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white disabled:opacity-70"
            >
              <option value="paused">Paused</option>
              <option value="active">Active</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              New campaigns should be reviewed before being made available
              to customers.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-[#b7ff35] px-5 py-4 font-extrabold text-[#071b10] opacity-50"
          >
            Campaign saving will be enabled after database connection
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#31583a] bg-[#09170e] p-4 sm:p-6">
        <h2 className="text-lg font-extrabold text-white">
          Campaign records
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Campaigns, claim counts and remaining slots will appear here after
          the database connection.
        </p>

        <div className="mt-5 rounded-xl border border-dashed border-[#426b37] bg-[#10291a]/50 p-6 text-center">
          <p className="text-3xl">％</p>
          <p className="mt-3 font-bold text-white">
            No campaign records loaded
          </p>
          <p className="mt-2 text-sm text-gray-400">
            The campaign list will become available when secure storage is
            connected.
          </p>
        </div>
      </section>
    </Shell>
  );
      }
