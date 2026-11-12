
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CampaignStatus = "draft" | "published" | "paused";

export default function CampaignActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: CampaignStatus;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function changeStatus(nextStatus: CampaignStatus) {
    const action =
      nextStatus === "published"
        ? "publish"
        : nextStatus === "paused"
          ? "pause"
          : "return this campaign to draft";

    if (!window.confirm(`Are you sure you want to ${action} this campaign?`)) {
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.rpc("admin_set_promo_status", {
      p_campaign_id: campaignId,
      p_status: nextStatus,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`Campaign successfully ${nextStatus}.`);
    router.refresh();
  }

  return (
    <div className="mt-5 border-t border-[#31583a] pt-4">
      <div className="flex flex-wrap gap-2">
        {status !== "published" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => changeStatus("published")}
            className="rounded-lg bg-[#b7ff35] px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Publish campaign"}
          </button>
        )}

        {status === "published" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => changeStatus("paused")}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Pause campaign"}
          </button>
        )}

        {status !== "draft" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => changeStatus("draft")}
            className="rounded-lg border border-[#64806a] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Return to draft
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-green-400">{message}</p>
      )}

      {errorMessage && (
        <p className="mt-3 break-words text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
      }
      
