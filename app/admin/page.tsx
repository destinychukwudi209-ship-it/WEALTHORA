
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import CampaignForm from "./campaign-form";
import CampaignActions from "./campaign-actions";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const { supabase } = await requireAdmin();

  const { data: campaigns, error } = await supabase
    .from("promo_campaigns")
    .select(
      "id, campaign_name, code, reward_type, reward_value, reward_details, max_claims, claims_count, starts_at, ends_at, status, created_at"
    )
    .order("created_at", { ascending: false });

  const allCampaigns = campaigns || [];
  const activeCampaigns = allCampaigns.filter(
    (campaign) => campaign.status === "published"
  );

  const totalClaims = allCampaigns.reduce(
    (total, campaign) => total + Number(campaign.claims_count || 0),
    0
  );

  const availableSlots = allCampaigns.reduce(
    (total, campaign) =>
      total +
      Math.max(
        0,
        Number(campaign.max_claims || 0) -
          Number(campaign.claims_count || 0)
      ),
    0
  );

  return (
    <Shell>
      <PageTitle
        title="Promo Campaign Management"
        subtitle="Create, publish, pause and monitor promotional campaigns."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Total campaigns", allCampaigns.length],
          ["Active campaigns", activeCampaigns.length],
          ["Total claims", totalClaims],
          ["Available claim slots", availableSlots],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-[#31583a] bg-[#09170e] p-4"
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#b7ff35]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <CampaignForm />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-extrabold text-white">
          Existing campaigns
        </h2>

        {error && (
          <p className="rounded-xl bg-red-950 p-4 text-sm text-red-300">
            Could not load campaigns: {error.message}
          </p>
        )}

        {!error && allCampaigns.length === 0 && (
          <p className="rounded-xl border border-[#31583a] p-5 text-gray-400">
            No campaigns have been created yet.
          </p>
        )}

        <div className="space-y-4">
          {allCampaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="rounded-2xl border border-[#31583a] bg-[#09170e] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {campaign.campaign_name}
                  </h3>
                  <p className="mt-1 font-mono text-[#b7ff35]">
                    {campaign.code}
                  </p>
                </div>

                <span className="rounded-full border border-[#64806a] px-3 py-1 text-xs font-bold uppercase text-white">
                  {campaign.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                <p>
                  Reward:{" "}
                  <strong className="text-white">
                    {campaign.reward_type === "fixed_bonus"
                      ? `₦${Number(campaign.reward_value || 0).toLocaleString("en-NG")} Task Balance bonus`
                      : campaign.reward_type === "percentage_discount"
                        ? `${campaign.reward_value}% discount`
                        : campaign.reward_details || "Plan benefit"}
                  </strong>
                </p>

                <p>
                  Claims:{" "}
                  <strong className="text-white">
                    {campaign.claims_count} / {campaign.max_claims}
                  </strong>
                </p>

                <p>
                  Starts:{" "}
                  {new Date(campaign.starts_at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })}
                </p>

                <p>
                  Ends:{" "}
                  {new Date(campaign.ends_at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })}
                </p>
              </div>

              <CampaignActions
                campaignId={campaign.id}
                status={campaign.status}
              />
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
                                                               }
