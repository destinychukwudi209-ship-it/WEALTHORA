
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    if (googleLoading || loading) return;

    setGoogleLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || googleLoading) return;

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setMessage("Incorrect email or password. Please try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMessage("We could not verify your account. Please contact support.");
        return;
      }

      const status = String(profile.status || "").toLowerCase();

      if (["suspended", "frozen", "closed"].includes(status)) {
        await supabase.auth.signOut();
        router.replace(
          `/app/account-restricted?status=${encodeURIComponent(status)}`
        );
        return;
      }

      if (status !== "active") {
        await supabase.auth.signOut();
        setMessage("Your account is not active yet. Please contact support.");
        return;
      }

      const adminRoles = ["admin", "super_admin", "finance", "support"];

      router.replace(
        adminRoles.includes(profile.role) ? "/admin" : "/dashboard"
      );
      router.refresh();
    } catch {
      await supabase.auth.signOut();
      setMessage("Unable to sign in. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

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
          <div className="grid grid-cols-2 rounded-full border border-slate-100 bg-slate-50 p-1.5">
            <div className="rounded-full bg-[#1646C8] px-3 py-3 text-center text-sm font-extrabold text-white shadow-md">
              Sign In
            </div>
            <Link
              href="/register"
              className="rounded-full px-3 py-3 text-center text-sm font-bold text-slate-600 hover:bg-blue-50"
            >
              Create Account
            </Link>
          </div>

          <div className="mb-7 mt-9 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Sign in to access your WEALTHORA dashboard and account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-5 font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.84 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
            </svg>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm font-medium text-slate-500">or email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Email Address
              </span>
              <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-5 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                <span className="mr-3 text-xl text-slate-400">♙</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 bg-transparent py-5 text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-800">Password</span>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-[#1646C8] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-5 focus-within:border-[#1646C8] focus-within:ring-4 focus-within:ring-blue-100">
                <span className="mr-3 text-xl text-slate-400">♙</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 bg-transparent py-5 text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="ml-2 rounded-full p-2 text-xl text-slate-500 hover:bg-blue-100"
                >
                  {showPassword ? "◉" : "◎"}
                </button>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-5 w-5 accent-[#1646C8]"
              />
              Keep me signed in on this device
            </label>

            {message && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-full bg-[#1646C8] px-6 py-5 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Checking Account..." : "Sign In  →"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-extrabold text-[#1646C8] hover:underline">
              Sign Up for free
            </Link>
          </p>
        </section>

        <div className="mt-7 text-center">
          <Link href="/" className="text-sm font-semibold text-[#1646C8]">
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
