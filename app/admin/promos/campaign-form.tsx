"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type RewardType = "discount" | "bonus" | "plan_benefit";

export default function CampaignForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rewardType, setRewardType] = useState<RewardType>("discount");
  const [rewardValue, setRewardValue] = useState("");
  const [maxClaims, setMaxClaims] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function validate() {
    if (
      !name.trim() ||
      !code.trim() ||
      !rewardValue.trim() ||
      !maxClaims ||
      !startsAt ||
      !expiresAt
    ) {
      setError("Please complete all campaign details.");
      return false;
    }

    if (!/^[A-Za-z0-9_-]{4,30}$/.test(code.trim())) {
      setError("Use 4–30 letters, numbers, hyphens or underscores for the code.");
      return false;
    }

    if (!Number.isInteger(Number(maxClaims)) || Number(maxClaims) < 1) {
      setError("Maximum claims must be a whole number greater than zero.");
      return false;
    }

    if (
      rewardType !== "plan_benefit" &&
      (!Number.isFinite(Number(rewardValue)) || Number(rewardValue) <= 0)
    ) {
      setError("Enter a valid reward amount.");
      return false;
    }

    if (rewardType === "discount" && Number(rewardValue) > 100) {
      setError("A percentage discount cannot exceed 100%.");
      return false;
    }

    if (rewardType === "plan_benefit" && !rewardValue.trim()) {
      setError("Describe the investment-plan benefit.");
      return false;
    }

    if (new Date(expiresAt) <= new Date(startsAt)) {
      setError("The end date must be later than the start date.");
      return false;
    }

    if (
      Number.isNaN(new Date(startsAt).getTime()) ||
      Number.isNaN(new Date(expiresAt).getTime())
    ) {
      setError("Please enter valid campaign dates.");
      return false;
    }

    return true;
  }

  function handlePreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPreview(false);

    if (validate()) {
      setPreview(true);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!validate()) {
      setPreview(false);
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: saveError } = await supabase.rpc(
        "admin_create_promo_campaign",
        {
          p_campaign_name: name.trim(),
          p_code: code.trim().toUpperCase(),
          p_reward_type:
            rewardType === "discount"
              ? "percentage_discount"
              : rewardType === "bonus"
                ? "fixed_bonus"
                : "plan_benefit",
          p_reward_value:
            rewardType === "plan_benefit" ? null : Number(rewardValue),
          p_reward_details:
            rewardType === "plan_benefit" ? rewardValue.trim() : null,
          p_max_claims: Number(maxClaims),
          p_starts_at: new Date(startsAt).toISOString(),
          p_ends_at: new Date(expiresAt).toISOString(),
        }
      );

      if (saveError) {
        throw saveError;
      }

      setSuccess(
        "Campaign saved successfully as a draft. It is not published yet."
      );

      setName("");
      setCode("");
      setRewardType("discount");
      setRewardValue("");
      setMaxClaims("");
      setStartsAt("");
      setExpiresAt("");
      setPreview(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save campaign. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const rewardLabel =
    rewardType === "discount"
      ? `${rewardValue}% discount`
      : rewardType === "bonus"
        ? `₦${Number(rewardValue).toLocaleString("en-NG")} Task Balance bonus`
        : rewardValue;

  return (
    <section className="rounded-2xl border border-[#31583a] bg-[#09170e] p-4 sm:p-6">
      <h2 className="text-lg font-extrabold text-white">
        Create a campaign
      </h2>

      <p className="mt-1 text-sm text-gray-400">
        Create and save promotional campaigns. New campaigns are saved as
        drafts until an administrator publishes them.
      </p>

      <form onSubmit={handlePreview} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Campaign name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
            placeholder="e.g. Welcome promotion"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Promo code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 uppercase text-white"
            placeholder="e.g. WELCOME2026"
          />
          <p className="mt-1 text-xs text-gray-500">
            Customers will enter this code on their promo screen.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Reward type
          </label>
          <select
            value={rewardType}
            onChange={(e) => {
              setRewardType(e.target.value as RewardType);
              setRewardValue("");
            }}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
          >
            <option value="discount">Percentage discount</option>
            <option value="bonus">Fixed Task Balance bonus</option>
            <option value="plan_benefit">Investment plan benefit</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            {rewardType === "discount"
              ? "Discount percentage"
              : rewardType === "bonus"
                ? "Bonus amount (₦)"
                : "Describe the plan benefit"}
          </label>
          <input
            value={rewardValue}
            onChange={(e) => setRewardValue(e.target.value)}
            type={rewardType === "plan_benefit" ? "text" : "number"}
            min={rewardType === "plan_benefit" ? undefined : "0.01"}
            max={rewardType === "discount" ? "100" : undefined}
            step={rewardType === "plan_benefit" ? undefined : "0.01"}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
            placeholder={
              rewardType === "discount"
                ? "e.g. 10"
                : rewardType === "bonus"
                  ? "e.g. 500"
                  : "e.g. Extra plan benefit details"
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Maximum number of claims
          </label>
          <input
            value={maxClaims}
            onChange={(e) => setMaxClaims(e.target.value)}
            type="number"
            min="1"
            step="1"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
            placeholder="Enter the total claim limit"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Campaign start date and time
          </label>
          <input
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            type="datetime-local"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Campaign end date and time
          </label>
          <input
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            type="datetime-local"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl border border-green-500/30 bg-green-950/30 p-3 text-sm text-green-300">
            {success}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-xl border border-[#b7ff35] px-5 py-3 font-bold text-[#b7ff35]"
          >
            Preview campaign
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#b7ff35] px-5 py-3 font-extrabold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save campaign as draft"}
          </button>
        </div>
      </form>

      {preview && (
        <div className="mt-6 rounded-xl border border-[#b7ff35]/40 bg-[#10291a] p-4">
          <h3 className="font-bold text-[#b7ff35]">Campaign preview</h3>
          <p className="mt-3 text-sm text-gray-300">
            Campaign: <strong className="text-white">{name}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Code: <strong className="text-white">{code}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Reward: <strong className="text-white">{rewardLabel}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Maximum claims:{" "}
            <strong className="text-white">{maxClaims}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Starts: <strong className="text-white">{startsAt}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Ends: <strong className="text-white">{expiresAt}</strong>
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Preview only. Saving creates a draft; customers cannot redeem it
            until it is published.
          </p>
        </div>
      )}
    </section>
  );
}
