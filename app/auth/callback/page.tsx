"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Confirming your WEALTHORA account...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function confirmAccount() {
      const supabase = createClient();
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        setMessage("Confirmation link is missing or invalid. Please request a new email.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMessage("We couldn't confirm this link. Please request a fresh confirmation email.");
        return;
      }

      setMessage("Email confirmed! Opening your dashboard...");

      router.replace("/dashboard");
      router.refresh();
    }

    confirmAccount();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050806] px-5 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-[#293b27] bg-[#0e1712] p-8 text-center">
        <h1 className="text-3xl font-black tracking-widest">
          <span className="text-[#b7ff36]">WEALTH</span>ORA
        </h1>

        <p className="mt-6 text-gray-300">{message}</p>
      </div>
    </main>
  );
        }
