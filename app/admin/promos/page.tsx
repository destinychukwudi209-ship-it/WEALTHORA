import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import CampaignForm from "./campaign-form";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const { supabase, profile } = await requireAdmin();

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/admin");
  }

  const { data: campaigns, error } = await supabase
    .from("promo_campaigns")
    .select(
      "id,campaign_name,code,reward_type,reward_value,reward_details,max_claims,claims_count,starts_at,ends_at,status,created_at"
    )
    .order("created_at", { ascending: false });

  const records = campaigns ?? [];
  const now = new Date();

  const totalCampaigns = records.length;

  const activeCampaigns = records.filter(
    (campaign) =>
      campaign.status === "published" &&
      new Date(campaign.starts_at) <= now &&
      new Date(campaign.ends_at) >= now
  ).length;

  const totalClaims = records.reduce(
    (total, campaign) => total + Number(campaign.claims_count || 0),
    0
  );

  const availableSlots = records.reduce(
    (total, campaign) =>
      total +
      Math.max(
        0,
        Number(campaign.max_claims || 0) -
          Number(campaign.claims_count || 0)
      ),
    0
  );

  const stats = [
    { label: "Total campaigns", value: totalCampaigns },
    { label: "Active campaigns", value: activeCampaigns },
    { label: "Total claims", value: totalClaims },
    { label: "Available claim slots", value: availableSlots },
  ];

  return (
    <Shell>
      <PageTitle
        title="Promo Campaigns"
        subtitle="Create promotional campaigns and monitor customer claims."
      />

      <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-950/20 p-4">
        <p className="font-bold text-green-300">
          Campaign database connected
        </p>
        <p className="mt-2 text-sm text-green-100/80">
          Saved campaigns and claim statistics are loaded from the database.
          New campaigns are saved as drafts until published.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
          <p className="font-bold text-red-300">
            Unable to load campaign records
          </p>
          <p className="mt-2 break-words text-sm text-red-200">
            {error.message}
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#24452b] bg-[#09170e] p-4"
          >
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
              {error ? "—" : stat.value.toLocaleString("en-NG")}
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
          All campaigns saved by authorized administrators.
        </p>

        {!error && records.length === 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-[#426b37] bg-[#10291a]/50 p-6 text-center">
            <p className="text-3xl">％</p>
            <p className="mt-3 font-bold text-white">
              No campaign records yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Create your first campaign using the form above.
            </p>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {records.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-[#31583a] bg-[#10291a] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">
                    {campaign.campaign_name}
                  </h3>
                  <p className="mt-1 text-sm font-bold tracking-wider text-[#b7ff35]">
                    {campaign.code}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    campaign.status === "published"
                      ? "bg-green-500/15 text-green-300"
                      : campaign.status === "paused"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {campaign.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Reward type</p>
                  <p className="mt-1 text-white">
                    {campaign.reward_type === "percentage_discount"
                      ? `${campaign.reward_value}% discount`
                      : campaign.reward_type === "fixed_bonus"
                        ? `₦${Number(campaign.reward_value).toLocaleString("en-NG")} Task Balance bonus`
                        : campaign.reward_details || "Plan benefit"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Claims</p>
                  <p className="mt-1 text-white">
                    {campaign.claims_count} / {campaign.max_claims}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Remaining slots</p>
                  <p className="mt-1 text-white">
                    {Math.max(
                      0,
                      Number(campaign.max_claims) -
                        Number(campaign.claims_count)
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Start date</p>
                  <p className="mt-1 text-white">
                    {new Date(campaign.starts_at).toLocaleString("en-NG")}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-400">End date</p>
                  <p className="mt-1 text-white">
                    {new Date(campaign.ends_at).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
        }
