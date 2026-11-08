"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResendConfirmation() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(
          "We couldn't send the email right now. Please wait a little and try again."
        );
        return;
      }

      setMessage(
        "If your account is awaiting verification, a fresh confirmation email has been sent. Check your inbox and spam folder."
      );
    } catch {
      setMessage(
        "Unable to send the confirmation email right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050806] px-4 py-10 text-white">
      <form
        onSubmit={handleResend}
        className="w-full max-w-lg space-y-6 rounded-3xl border border-[#293b27] bg-[#0e1712] p-7 shadow-2xl"
      >
        <h1 className="text-center text-3xl font-black tracking-widest">
          <span className="text-[#b7ff36]">WEALTH</span>ORA
        </h1>

        <h2 className="text-2xl font-bold">
          Resend confirmation email
        </h2>

        <p className="text-sm text-gray-400">
          Enter the same email address you used when creating your account.
        </p>

        <label htmlFor="email" className="block text-sm font-medium">
          Email address
        </label>

        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-[#dce7f7] bg-[#e8f0ff] p-4 text-[#111827] outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#b7ff36] p-4 font-bold text-[#071006] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Resend confirmation"}
        </button>

        {message && (
          <p
            role="status"
            className="rounded-xl bg-[#17251a] p-4 text-sm text-gray-200"
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-400">
          <Link
            href="/login"
            className="font-semibold text-[#b7ff36]"
          >
            Back to Sign In
          </Link>
        </p>
      </form>
    </main>
  );
        }
