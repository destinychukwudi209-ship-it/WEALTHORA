
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Sign-in failed. Check your email and password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,150,25,0.12),_transparent_65%)]" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-[610px] rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-[0.08em] sm:text-5xl">
            <span className="text-[#b7ff36]">WEALTH</span>
            <span className="text-white">ORA</span>
          </h1>
          <p className="mt-5 text-base text-[#929b94] sm:text-xl">
            Your financial growth platform
          </p>
        </div>

        <div className="mb-9">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome Back
          </h2>
          <p className="mt-4 text-base text-[#929b94] sm:text-lg">
            Sign in to access your account.
          </p>
        </div>

        <div className="grid gap-7">
          <div>
            <label
              htmlFor="email"
              className="mb-3 block text-base font-medium text-[#e2e8e3] sm:text-lg"
            >
              Email Address
            </label>
            <input
              id="email"
              className="w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-5 text-base text-[#111827] outline-none transition focus:border-[#b7ff36] focus:ring-2 focus:ring-[#b7ff36]/30 sm:text-xl"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-base font-medium text-[#e2e8e3] sm:text-lg"
            >
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-5 text-base text-[#111827] outline-none transition focus:border-[#b7ff36] focus:ring-2 focus:ring-[#b7ff36]/30 sm:text-xl"
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-2xl bg-[#b7ff36] px-5 py-5 text-xl font-bold text-[#071006] shadow-lg transition hover:bg-[#a8f329] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {message && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300"
          >
            {message}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 text-sm font-semibold sm:text-lg">
          <Link
            href="/forgot-password"
            className="text-[#b7ff36] transition hover:text-white"
          >
            Forgot Password?
          </Link>

          <Link
            href="/register"
            className="text-[#b7ff36] transition hover:text-white"
          >
            Create Account
          </Link>
        </div>
      </form>
    </main>
  );
              }
