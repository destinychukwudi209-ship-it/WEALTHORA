"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("there");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;

      setName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "there"
      );

      setPhoto(
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        user.user_metadata?.profile_image_url ||
        ""
      );
    });
  }, []);

  const links = [
    { href: "/dashboard", label: "Home", icon: "⌂" },
    { href: "/invest", label: "Invest", icon: "▥" },
    { href: "/transactions", label: "History", icon: "◷" },
    { href: "/support", label: "Support", icon: "♧" },
    { href: "/settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-[#10265c]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-blue-100 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => window.location.assign("/profile")}
          className="text-2xl text-blue-800"
          aria-label="Open profile"
        >
          ☰
        </button>

        <Link href="/dashboard" className="text-lg font-black tracking-tight text-blue-800">
          WEALTHORA
          <span className="block text-center text-[9px] font-semibold tracking-widest">
            INVEST · EARN · GROW
          </span>
        </Link>

        <Link href="/profile" aria-label="My profile">
          {photo ? (
            <img
              src={photo}
              alt="Your profile"
              className="h-10 w-10 rounded-full border-2 border-blue-400 object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-800">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-blue-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-lg backdrop-blur">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1 py-2 text-blue-800"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-semibold">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
            }
