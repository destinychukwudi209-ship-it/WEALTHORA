
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        "Your registration has been submitted. Please check your email and verify your account before signing in."
      );
    } catch {
      setMessage("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#1646C8] focus:ring-4 focus:ring-blue-100";

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
        <Link href="/" className="mb-8 flex flex-col items-center">
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
          <div className="grid grid-cols-2 rounded-full border border-slate-100 bg-slate-50 p-1.5">
            <Link
              href="/login"
              className="rounded-full px-3 py-3 text-center text-sm font-bold text-slate-600 hover:bg-blue-50"
            >
              Sign In
            </Link>

            <div className="rounded-full bg-[#1646C8] px-3 py-3 text-center text-sm font-extrabold text-white shadow-md">
              Create Account
            </div>
          </div>

          <div className="mb-7 mt-9 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Join WEALTHORA and manage your account securely.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Full Name
              </span>

              <input
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Email Address
              </span>

              <input
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Password
              </span>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 pr-3 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={12}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-slate-900 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded-lg px-2 py-2 text-sm font-bold text-[#1646C8]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                At least 12 characters, with uppercase, lowercase, number and symbol.
              </p>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Confirm Password
              </span>

              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 pr-3 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-slate-900 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="rounded-lg px-2 py-2 text-sm font-bold text-[#1646C8]"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {message && (
              <p
                role="status"
                className={`rounded-xl border p-4 text-sm leading-6 ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-full bg-[#1646C8] px-6 py-5 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : success
                  ? "Registration Submitted"
                  : "Create WEALTHORA Account →"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-extrabold text-[#1646C8] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </section>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-[#1646C8]"
          >
            ← Back to WEALTHORA
          </Link>

          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} WEALTHORA. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
                  }
