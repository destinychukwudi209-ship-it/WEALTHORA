
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

  async function handleLogin(e: React.FormEvent) {
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
    <main className="min-h-screen grid place-items-center bg-slate-100 p-5">
      <form
        onSubmit={handleLogin}
        className="panel w-full max-w-md grid gap-4"
      >
        <h1 className="text-2xl font-bold">
          Sign in to WEALTHORA
        </h1>

        <input
          className="border rounded-lg p-3"
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded-lg p-3"
          type="password"
          required
          minLength={12}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 underline"
          >
            Forgot password?
          </Link>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message && (
          <p role="alert" className="text-sm text-red-600">
            {message}
          </p>
        )}

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link href="/register" className="underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
        }
