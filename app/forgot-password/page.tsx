
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stage, setStage] = useState<"email" | "otp" | "done">("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/security/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Unable to process your request. Please try again."
        );
        return;
      }

      setStage("otp");
      setMessage(
        result.message ||
          "If an account exists for this email, a recovery code has been sent."
      );
    } catch {
      setMessage("Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

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
        "Use at least 12 characters with uppercase, lowercase, a number and a symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/security/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || "Password reset failed. Please try again."
        );
        return;
      }

      setStage("done");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setMessage("Your password has been changed successfully.");
    } catch {
      setMessage("Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#1646C8] focus:ring-4 focus:ring-blue-100";

  const buttonClass =
    "w-full rounded-full bg-[#1646C8] px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F7FF] px-4 py-10 text-[#102C70]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(22,70,200,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(22,70,200,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-[560px]">
        <Link href="/" className="mb-9 flex flex-col items-center">
          <span className="text-5xl font-black italic text-[#1646C8]">
            W<span className="text-[#F5B82E]">↗</span>
          </span>

          <span className="mt-1 text-3xl font-black tracking-tight">
            WEALTHORA
          </span>

          <span className="mt-1 text-xs font-bold tracking-[0.25em] text-slate-500">
            INVEST • EARN • GROW
          </span>
        </Link>

        <section className="rounded-[2rem] border border-white bg-white px-6 py-8 shadow-xl shadow-blue-100/80 sm:px-10 sm:py-10">
          <div className="mb-8 flex items-center justify-center gap-2">
            <span
              className={`h-2 flex-1 rounded-full ${
                stage === "email" || stage === "otp" || stage === "done"
                  ? "bg-[#1646C8]"
                  : "bg-slate-200"
              }`}
            />
            <span
              className={`h-2 flex-1 rounded-full ${
                stage === "otp" || stage === "done"
                  ? "bg-[#1646C8]"
                  : "bg-slate-200"
              }`}
            />
            <span
              className={`h-2 flex-1 rounded-full ${
                stage === "done" ? "bg-[#1646C8]" : "bg-slate-200"
              }`}
            />
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-[#1646C8]">
              {stage === "done" ? "✓" : "🔐"}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {stage === "email" && "Forgot Password?"}
              {stage === "otp" && "Verify Your Code"}
              {stage === "done" && "Password Updated"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {stage === "email" &&
                "Enter your registered email to receive a secure recovery code."}
              {stage === "otp" &&
                "Enter the six-digit code sent to your email and create a new password."}
              {stage === "done" &&
                "Your password recovery is complete. You can now sign in with your new password."}
            </p>
          </div>

          {stage === "email" && (
            <form onSubmit={sendCode} className="grid gap-5">
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Email Address

                <input
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <button className={buttonClass} disabled={loading}>
                {loading ? "Sending Recovery Code..." : "Send Recovery Code →"}
              </button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={verifyAndReset} className="grid gap-5">
              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Six-Digit Recovery Code

                <input
                  className={`${fieldClass} text-center text-xl font-extrabold tracking-[0.5em]`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-800">
                New Password

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 pr-3 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-slate-900 outline-none"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="px-2 py-2 text-sm font-bold text-[#1646C8]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <span className="text-xs font-normal text-slate-500">
                  At least 12 characters with uppercase, lowercase, number and symbol.
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-800">
                Confirm New Password

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 pr-3 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-slate-900 outline-none"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter your new password again"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="px-2 py-2 text-sm font-bold text-[#1646C8]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button className={buttonClass} disabled={loading}>
                {loading ? "Verifying..." : "Verify Code and Reset Password →"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => sendCode()}
                className="rounded-full border border-blue-100 bg-blue-50 px-5 py-3 font-bold text-[#1646C8] disabled:opacity-50"
              >
                Resend Recovery Code
              </button>
            </form>
          )}

          {stage === "done" && (
            <Link href="/login" className={`${buttonClass} block text-center`}>
              Return to Sign In →
            </Link>
          )}

          {message && (
            <p
              role="status"
              className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                stage === "done"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-blue-100 bg-blue-50 text-blue-900"
              }`}
            >
              {message}
            </p>
          )}

          {stage !== "done" && (
            <Link
              href="/login"
              className="mt-7 block text-center text-sm font-bold text-[#1646C8] hover:underline"
            >
              ← Back to Sign In
            </Link>
          )}
        </section>

        <p className="mt-7 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} WEALTHORA. All rights reserved.
        </p>
      </div>
    </main>
  );
    }
