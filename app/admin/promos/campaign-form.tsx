
"use client";

import { useState, type FormEvent } from "react";

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

  function handlePreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPreview(false);

    if (!name.trim() || !code.trim() || !rewardValue.trim() || !maxClaims) {
      setError("Please complete all required campaign details.");
      return;
    }

    if (!/^[A-Za-z0-9_-]{4,30}$/.test(code.trim())) {
      setError("Use 4–30 letters, numbers, hyphens or underscores for the code.");
      return;
    }

    if (!Number.isInteger(Number(maxClaims)) || Number(maxClaims) < 1) {
      setError("Maximum claims must be a whole number greater than zero.");
      return;
    }

    if (
      rewardType !== "plan_benefit" &&
      (!Number.isFinite(Number(rewardValue)) || Number(rewardValue) <= 0)
    ) {
      setError("Enter a valid reward amount.");
      return;
    }

    if (rewardType === "discount" && Number(rewardValue) > 100) {
      setError("A percentage discount cannot exceed 100%.");
      return;
    }

    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      setError("The end date must be later than the start date.");
      return;
    }

    setPreview(true);
  }

  const rewardLabel =
    rewardType === "discount"
      ? `${rewardValue}% discount`
      : rewardType === "bonus"
        ? `₦${Number(rewardValue).toLocaleString("en-NG")} bonus`
        : rewardValue;

  return (
    <section className="rounded-2xl border border-[#31583a] bg-[#09170e] p-4 sm:p-6">
      <h2 className="text-lg font-extrabold text-white">Create a campaign</h2>
      <p className="mt-1 text-sm text-gray-400">
        Enter campaign details and preview them before database publishing is enabled.
      </p>

      <form onSubmit={handlePreview} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-200">
            Campaign name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Example: Welcome Campaign"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-200">
            Promo code *
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={30}
            placeholder="WELCOME2026"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 uppercase text-white placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Codes will be checked for duplicates when connected to the database.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-200">
            Reward type *
          </label>
          <select
            value={rewardType}
            onChange={(e) => {
              setRewardType(e.target.value as RewardType);
              setPreview(false);
            }}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
          >
            <option value="discount">Percentage discount</option>
            <option value="bonus">Fixed bonus amount</option>
            <option value="plan_benefit">Extra investment-plan benefit</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-200">
            {rewardType === "plan_benefit"
              ? "Benefit description *"
              : rewardType === "discount"
                ? "Discount percentage *"
                : "Bonus amount in naira *"}
          </label>
          <input
            value={rewardValue}
            onChange={(e) => setRewardValue(e.target.value)}
            placeholder={
              rewardType === "discount"
                ? "10"
                : rewardType === "bonus"
                  ? "5000"
                  : "Describe the plan benefit"
            }
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-200">
            Maximum number of claims *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={maxClaims}
            onChange={(e) => setMaxClaims(e.target.value)}
            placeholder="Example: 100"
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            The system will stop accepting claims when this limit is reached.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              Start date and time
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-200">
              End date and time
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-3 text-white"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#b7ff35] px-5 py-4 font-extrabold text-[#071b10]"
        >
          Preview campaign
        </button>
      </form>

      {preview && (
        <div className="mt-6 rounded-2xl border border-[#426b37] bg-[#10291a] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#b7ff35]">
            Campaign preview only
          </p>
          <h3 className="mt-3 text-lg font-extrabold text-white">{name}</h3>
          <p className="mt-2 text-sm text-gray-300">
            Promo code: <strong className="text-white">{code}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Reward: <strong className="text-white">{rewardLabel}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Maximum claims: <strong className="text-white">{maxClaims}</strong>
          </p>
          <p className="mt-4 text-xs text-amber-300">
            This preview has not been saved or published. Database connection is still required.
          </p>
        </div>
      )}
    </section>
  );
                                                          }
