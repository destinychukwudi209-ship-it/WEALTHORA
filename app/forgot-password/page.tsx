
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

  async function sendCode(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

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
        "Use at least 12 characters, including uppercase, lowercase, a number and a symbol."
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

  const fieldClass =
    "w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-4 text-base text-[#111827] outline-none focus:border-[#b7ff36] focus:ring-2 focus:ring-[#b7ff36]/30";

  const buttonClass =
    "w-full rounded-2xl bg-[#b7ff36] px-5 py-4 font-bold text-[#071006] disabled:opacity-50";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,150,25,0.12),_transparent_65%)]" />

      <section className="relative z-10 grid w-full max-w-[610px] gap-6 rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 shadow-2xl sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-[0.08em]">
            <span className="text-[#b7ff36]">WEALTH</span>
            <span className="text-white">ORA</span>
          </h1>
          <p className="mt-4 text-[#929b94]">
            Your financial growth platform
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            {stage === "email" && "Forgot Password?"}
            {stage === "otp" && "Verify Your Code"}
            {stage === "done" && "Password Updated"}
          </h2>
          <p className="mt-3 text-[#929b94]">
            {stage === "email" &&
              "Enter your registered email to receive a recovery code."}
            {stage === "otp" &&
              "Enter the 6-digit code sent to your email and choose a new password."}
            {stage === "done" &&
              "Your password recovery is complete."}
          </p>
        </div>

        {stage === "email" && (
          <form onSubmit={sendCode} className="grid gap-5">
            <label className="grid gap-3 font-medium">
              Email Address
              <input
                className={fieldClass}
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button className={buttonClass} disabled={loading}>
              {loading ? "Sending..." : "Send Recovery Code"}
            </button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyAndReset} className="grid gap-5">
            <label className="grid gap-3 font-medium">
              6-Digit Recovery Code
              <input
                className={fieldClass}
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </label>

            <label className="grid gap-3 font-medium">
              New Password
              <input
                className={fieldClass}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create new password"
              />
            </label>

            <label className="grid gap-3 font-medium">
              Confirm New Password
              <input
                className={fieldClass}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </label>

            <button className={buttonClass} disabled={loading}>
              {loading ? "Verifying..." : "Verify Code and Reset Password"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => sendCode()}
              className="font-semibold text-[#b7ff36] disabled:opacity-50"
            >
              Resend Recovery Code
            </button>
          </form>
        )}

        {stage === "done" && (
          <Link href="/login" className={`${buttonClass} text-center`}>
            Return to Sign In
          </Link>
        )}

        {message && (
          <p role="status" className="rounded-xl border border-[#526b36] bg-[#17251a] p-4 text-sm text-[#d9e7d6]">
            {message}
          </p>
        )}

        {stage !== "done" && (
          <Link
            href="/login"
            className="text-center font-semibold text-[#b7ff36]"
          >
            Back to Sign In
          </Link>
        )}
      </section>
    </main>
  );
      }
            
