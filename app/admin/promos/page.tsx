
"use client";

import { useState, type FormEvent } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

export default function PromosPage() {
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const promoCode = code.trim().toUpperCase();

    if (!promoCode) {
      setErrorMessage("Please enter a promo code.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setSuccess("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc("redeem_promo_code", {
        p_code: promoCode,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (result && typeof result === "object") {
        const response = result as Record<string, unknown>;

        if (response.success === false || response.error) {
          setErrorMessage(
            String(response.message || response.error || "Promo redemption failed.")
          );
          return;
        }

        setSuccess(
          String(response.message || "Your promo code was redeemed successfully.")
        );
      } else if (typeof result === "string" && result.trim()) {
        setSuccess(result);
      } else {
        setSuccess("Your promo code was redeemed successfully.");
      }

      setCode("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <PageTitle
        title="Redeem promo code"
        subtitle="Enter a valid promotional code to claim its available reward."
      />

      <section className="max-w-lg rounded-2xl border border-[#31583a] bg-[#09170e] p-5 sm:p-6">
        <div className="mb-5">
          <p className="font-bold text-white">Have a promo code?</p>
          <p className="mt-2 text-sm text-gray-400">
            Enter your code below. Each campaign has its own dates and claim
            limit, and each customer can redeem a campaign only once.
          </p>
        </div>

        <form onSubmit={handleRedeem}>
          <label
            htmlFor="promo-code"
            className="mb-2 block text-sm font-semibold text-white"
          >
            Promo code
          </label>

          <input
            id="promo-code"
            type="text"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.toUpperCase())
            }
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Enter your promo code"
            disabled={loading}
            className="w-full rounded-xl border border-[#31583a] bg-[#10291a] p-4 text-base font-bold tracking-wider text-white caret-[#b7ff35] placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 outline-none focus:border-[#b7ff35] disabled:opacity-60"
          />

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300"
            >
              {errorMessage}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-green-500/30 bg-green-950/30 p-3 text-sm text-green-300"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="mt-5 w-full rounded-xl bg-[#b7ff35] px-5 py-3 font-extrabold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Validating promo code..." : "Redeem promo code"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-gray-400">
          Only published campaigns within their valid dates and available
          claim limits can be redeemed.
        </p>
      </section>
    </Shell>
  );
    }
