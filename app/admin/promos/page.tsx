
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import CampaignForm from "./campaign-form";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const { profile } = await requireAdmin();

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
        <p className="font-bold text-amber-300">
          Campaign publishing is not connected yet
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-100/80">
          You can prepare and preview campaign details here. Saving,
          publishing and customer redemption will be enabled after the
          secure database connection is completed.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          "Total campaigns",
          "Active campaigns",
          "Total claims",
          "Available claim slots",
        ].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-[#24452b] bg-[#09170e] p-4"
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
              —
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              Awaiting database connection
            </p>
          </div>
        ))}
      </div>

      <CampaignForm />

      <section className="mt-8 rounded-2xl border border-[#31583a] bg-[#09170e] p-4 sm:p-6">
        <h2 className="text-lg font-extrabold text-white">
          Campaign records
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Your campaign list will appear here after the database is connected.
        </p>

        <div className="mt-5 rounded-xl border border-dashed border-[#426b37] bg-[#10291a]/50 p-6 text-center">
          <p className="text-3xl">％</p>
          <p className="mt-3 font-bold text-white">
            No campaign records loaded
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Claim history, used slots and remaining slots will be displayed here.
          </p>
        </div>
      </section>
    </Shell>
  );
          }
