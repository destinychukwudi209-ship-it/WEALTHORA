"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (
      password.length < 12 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setMessage(
        "Password must contain at least 12 characters, including uppercase, lowercase, a number and a symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setSuccess(true);
      setMessage(
        "Registration submitted. Please check your email for the verification link before signing in."
      );
    } catch {
      setMessage("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-5 text-base text-[#111827] outline-none focus:border-[#b7ff36] focus:ring-2 focus:ring-[#b7ff36]/30";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,150,25,0.12),_transparent_65%)]" />

      <form
        onSubmit={handleRegister}
        className="relative z-10 grid w-full max-w-[610px] gap-6 rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] sm:px-10"
      >
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-[0.08em] sm:text-5xl">
            <span className="text-[#b7ff36]">WEALTH</span>
            <span className="text-white">ORA</span>
          </h1>
          <p className="mt-4 text-[#929b94] sm:text-xl">
            Your financial growth platform
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-3 text-[#929b94]">
            Join WEALTHORA today.
          </p>
        </div>

        <div>
          <label htmlFor="fullName" className="mb-3 block font-medium text-[#e2e8e3]">
            Full Name
          </label>
          <input
            id="fullName"
            className={fieldClass}
            type="text"
            autoComplete="name"
            required
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-3 block font-medium text-[#e2e8e3]">
            Email Address
          </label>
          <input
            id="email"
            className={fieldClass}
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-3 block font-medium text-[#e2e8e3]">
            Password
          </label>
          <input
            id="password"
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-3 block font-medium text-[#e2e8e3]">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            required
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full rounded-2xl bg-[#b7ff36] px-5 py-5 text-xl font-bold text-[#071006] shadow-lg transition hover:bg-[#a8f329] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating Account..."
            : success
              ? "Registration Submitted"
              : "Create Account"}
        </button>

        {message && (
          <p
            role="status"
            className={`rounded-xl border p-4 text-sm ${
              success
                ? "border-[#526b36] bg-[#17251a] text-[#d9e7d6]"
                : "border-red-500/30 bg-red-950/40 text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-[#929b94]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#b7ff36]">
            Sign In
          </Link>
        </p>
      </form>
    </main>
  );
  }
