
"use client";

import { useState } from "react";
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

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);

    if (error) {
      setMessage("Unable to send the code right now. Please try again later.");
      return;
    }

    setStage("otp");
    setMessage(
      "If an account exists for this email, a 6-digit recovery code has been sent."
    );
  }

  async function verifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the 6-digit code.");
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

    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "recovery",
    });

    if (otpError) {
      setLoading(false);
      setMessage("The code is invalid or expired. Request a new code.");
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
    setMessage("Your password has been changed. Please sign in again.");
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-100 p-5">
      <section className="panel w-full max-w-md grid gap-4">
        <h1 className="text-2xl font-bold">
          WEALTHORA Password Recovery
        </h1>

        {stage === "email" && (
          <form onSubmit={sendCode} className="grid gap-4">
            <p>Enter your registered email to receive a recovery code.</p>
            <input
              className="border rounded-lg p-3"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" disabled={loading}>
              {loading ? "Sending..." : "Send 6-digit code"}
            </button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyAndReset} className="grid gap-4">
            <p>Enter the 6-digit code sent to your email.</p>
            <input
              className="border rounded-lg p-3"
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
              className="border rounded-lg p-3"
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="border rounded-lg p-3"
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify code and change password"}
            </button>
          </form>
        )}

        {stage === "done" && (
          <a href="/login" className="btn text-center">
            Return to sign in
          </a>
        )}

        {message && <p role="status">{message}</p>}

        {stage === "otp" && (
          <button
            type="button"
            className="text-sm underline"
            disabled={loading}
            onClick={sendCode}
          >
            Resend code
          </button>
        )}

        <a href="/login" className="text-sm underline">
          Back to login
        </a>
      </section>
    </main>
  );
  }
        
