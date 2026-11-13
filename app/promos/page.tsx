
"use client";

import { useState, type FormEvent } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type RedemptionResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function Promos() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setIsError(true);
      setMessage("Enter a promo code before continuing.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in before redeeming a promo code.");
      }

      const { data, error } = await supabase.rpc(
        "redeem_promo_code",
        { p_code: normalizedCode }
      );

      if (error) throw error;

      const result = data as RedemptionResult | null;

      if (result?.success === false) {
        throw new Error(
          result.message || result.error || "Promo code could not be redeemed."
        );
      }

      setMessage(
        result?.message ||
          "Promo code submitted successfully. Check your wallet for reward details."
      );
      setCode("");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to redeem this promo code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <PageTitle
        title="Redeem promo code"
        subtitle="Apply a valid promotional code to your account."
      />

      <section className="max-w-lg rounded-2xl border border-[#31583a] bg-[#09170e] p-5 sm:p-6">
        <form onSubmit={handleRedeem} className="space-y-5">
          <div>
            <label
              htmlFor="promo-code"
              className="mb-2 block text-sm font-semibold text-gray-200"
            >
              Promo code
            </label>

            <input
              id="promo-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase())
              }
              className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-4 uppercase text-white"
              placeholder="Enter your promo code"
              autoComplete="off"
              maxLength={30}
              required
            />
          </div>

          {message && (
            <div
              role="alert"
              className={`rounded-xl border p-4 text-sm ${
                isError
                  ? "border-red-500/30 bg-red-950/30 text-red-300"
                  : "border-green-500/30 bg-green-950/30 text-green-300"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-xl bg-[#b7ff35] px-5 py-3 font-extrabold text-black disabled:opacity-50"
          >
            {loading ? "Checking promo code..." : "Redeem promo code"}
          </button>
        </form>

        <p className="mt-4 text-xs leading-5 text-gray-400">
          Promo codes must be active, within their campaign dates
          and have available claim slots. Each account can
          redeem a campaign only once.
        </p>
      </section>
    </Shell>
  );
    }
