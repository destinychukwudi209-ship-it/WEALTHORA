
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        setMessage(result.message || "Unable to process your request. Please try again.");
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
    "w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-4 text-base text-[#111827] outline-none focus:border-[#b7ff36]";

  const buttonClass =
    "w-full rounded-2xl bg-[#b7ff36] px-5 py-4 font-bold text-[#071006] disabled:opacity-50";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050806] px-4 py-10 text-white">
      <section className="grid w-full max-w-[610px] gap-6 rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-[0.08em]">
            <span className="text-[#b7ff36]">WEALTH</span>ORA
          </h1>
          <p className="mt-4 text-[#929b94]">
            Your financial growth platform
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">
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
              "Your password recovery is complete. You can now sign in."}
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
          <p
            role="status"
            className="rounded-xl border border-[#526b36] bg-[#17251a] p-4 text-sm text-[#d9e7d6]"
          >
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
                  
