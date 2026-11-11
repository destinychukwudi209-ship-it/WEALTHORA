
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setMessage("Incorrect email or password. Please check and try again.");
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

      if (["suspended", "frozen", "closed"].includes(profile.status)) {
        await supabase.auth.signOut();
        router.replace(
          `/account-restricted?status=${encodeURIComponent(profile.status)}`
        );
        return;
      }

      if (profile.status !== "active") {
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
    <main className="flex min-h-screen items-center justify-center bg-[#050806] px-4 py-10 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-[610px] rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 sm:px-10"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-[0.08em]">
            <span className="text-[#b7ff36]">WEALTH</span>ORA
          </h1>
          <p className="mt-5 text-[#929b94]">
            Your financial growth platform
          </p>
        </div>

        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="mb-8 mt-3 text-[#929b94]">
          Sign in to access your account.
        </p>

        <div className="grid gap-6">
          <label className="grid gap-3 font-medium">
            Email Address
            <input
              className="w-full rounded-2xl bg-[#e8f0ff] px-5 py-5 text-[#111827]"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </label>

          <label className="grid gap-3 font-medium">
            Password
            <input
              className="w-full rounded-2xl bg-[#e8f0ff] px-5 py-5 text-[#111827]"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-2xl bg-[#b7ff36] px-5 py-5 text-xl font-bold text-[#071006] disabled:opacity-60"
        >
          {loading ? "Checking Account..." : "Sign In"}
        </button>

        {message && (
          <p role="alert" className="mt-4 rounded-xl bg-red-950/40 p-3 text-sm text-red-300">
            {message}
          </p>
        )}

        <div className="mt-8 flex justify-between gap-4 text-sm font-semibold">
          <Link href="/forgot-password" className="text-[#b7ff36]">
            Forgot Password?
          </Link>
          <Link href="/register" className="text-[#b7ff36]">
            Create Account
          </Link>
        </div>
      </form>
    </main>
  );
            }
