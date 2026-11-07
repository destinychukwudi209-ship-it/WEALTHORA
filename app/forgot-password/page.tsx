
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState<"email" | "otp" | "done">("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);

    if (error) {
      setMessage("Unable to send your recovery code. Please try again.");
      return;
    }

    setStage("otp");
    setMessage(
      "If an account exists for this email, a 6-digit recovery code has been sent."
    );
  }

  async function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sendCode();
  }

  async function verifyAndReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    if (
      password.length < 12 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setMessage(
        "Password must have at least 12 characters, uppercase, lowercase, a number and a symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "recovery",
    });

    if (otpError) {
      setLoading(false);
      setMessage("Invalid or expired code. Please request a new code.");
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      setLoading(false);
      setMessage("Password update failed. Please try again.");
      return;
    }

    await supabase.auth.signOut();

    setLoading(false);
    setStage("done");
    setMessage("Your password has been changed successfully.");
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-950 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl grid gap-5 text-white">
        <div className="text-center grid gap-2">
          <h1 className="text-3xl font-bold tracking-wide">
            WEALTHORA
          </h1>
          <p className="text-sm text-slate-400">
            Secure account recovery
          </p>
        </div>

        <h2 className="text-xl font-semibold">
          {stage === "email" && "Forgot your password?"}
          {stage === "otp" && "Verify your recovery code"}
          {stage === "done" && "Password updated"}
        </h2>

        {stage === "email" && (
          <form onSubmit={handleSendCode} className="grid gap-4">
            <p className="text-sm text-slate-300">
              Enter your registered email address to receive a 6-digit recovery code.
            </p>

            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send recovery code"}
            </button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyAndReset} className="grid gap-4">
            <p className="text-sm text-slate-300">
              Enter the 6-digit code sent to your email and choose a new password.
            </p>

            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify code and reset password"}
            </button>

            <button
              type="button"
              className="text-sm text-blue-400 underline disabled:opacity-50"
              disabled={loading}
              onClick={sendCode}
            >
              Resend recovery code
            </button>
          </form>
        )}

        {stage === "done" && (
          <Link
            href="/login"
            className="w-full rounded-lg bg-blue-600 p-3 text-center font-semibold"
          >
            Return to sign in
          </Link>
        )}

        {message && (
          <p role="status" className="text-sm text-slate-300">
            {message}
          </p>
        )}

        {stage !== "done" && (
          <Link
            href="/login"
            className="text-center text-sm text-slate-400 underline"
          >
            Back to login
          </Link>
        )}
      </section>
    </main>
  );
      }
