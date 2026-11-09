"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DepositForm() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a valid deposit amount.");
      return;
    }

    if (!proof) {
      setMessage("Please select your payment receipt.");
      return;
    }

    if (proof.size > 5 * 1024 * 1024) {
      setMessage("Your receipt must not exceed 5 MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "application/pdf"].includes(proof.type)) {
      setMessage("Upload a JPG, PNG, or PDF receipt.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please sign in again.");
      }

      const user = authData.user;
      const extension = proof.type === "application/pdf"
        ? "pdf"
        : proof.type === "image/png"
        ? "png"
        : "jpg";

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("deposit-proofs")
        .upload(filePath, proof, {
          contentType: proof.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("deposit_requests")
        .insert({
          user_id: user.id,
          amount: value,
          payment_reference: reference.trim() || null,
          proof_url: filePath,
          status: "pending",
        });

      if (insertError) {
        await supabase.storage
          .from("deposit-proofs")
          .remove([filePath]);

        throw insertError;
      }

      setAmount("");
      setReference("");
      setProof(null);
      setMessage("Deposit submitted successfully. Awaiting admin verification.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your deposit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitDeposit} className="panel space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Amount transferred (₦)
        </label>
        <input
          type="number"
          min="1"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border p-3 bg-transparent"
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Payment reference
        </label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full rounded-lg border p-3 bg-transparent"
          placeholder="Enter transfer reference"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Upload payment receipt
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          required
          onChange={(e) => setProof(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
        <p className="muted text-xs mt-2">
          JPG, PNG or PDF. Maximum size: 5 MB.
        </p>
      </div>

      {message && (
        <p className="text-sm" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Submitting..." : "Submit Deposit"}
      </button>

      <p className="muted text-xs">
        Your Main Balance is not credited until an administrator verifies
        and approves your payment.
      </p>
    </form>
  );
        }
