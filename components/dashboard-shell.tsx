
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/invest", label: "Invest", icon: "▥" },
  { href: "/transactions", label: "History", icon: "◷" },
  { href: "/referrals", label: "Affiliate Centre", icon: "♧" },
  { href: "/support", label: "Get Support", icon: "◉" },
  { href: "/profile", label: "My Profile", icon: "◎" },
  { href: "/wallet", label: "My Wallet", icon: "◈" },
  { href: "/notifications", label: "Notifications", icon: "♢" },
  { href: "/settings", label: "Settings & Security", icon: "⚙" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("there");
  const [photo, setPhoto] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !active) return;

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (
        active &&
        profile &&
        ["admin", "super_admin"].includes(profile.role) &&
        profile.status === "active"
      ) {
        setIsAdmin(true);
      }
    }

    loadAccount();
    return () => { active = false; };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-[#10265c]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-blue-100 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="px-2 py-1 text-3xl text-blue-800"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <Link href="/dashboard" className="text-center text-lg font-black text-blue-800">
          WEALTHORA
          <span className="block text-[9px] font-semibold tracking-widest">
            INVEST · EARN · GROW
          </span>
        </Link>

        <Link href="/profile" aria-label="My profile">
          {photo ? (
            <img
              src={photo}
              alt="Your profile"
              className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-800">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/50"
          onClick={closeMenu}
        >
          <aside
            className="absolute bottom-0 left-0 top-0 w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5 flex items-center justify-between border-b border-blue-100 pb-4">
              <div>
                <p className="font-black text-blue-800">WEALTHORA</p>
                <p className="text-xs text-slate-500">Hello, {name}</p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg bg-blue-50 px-3 py-2 text-xl text-blue-800"
              >
                ×
              </button>
            </div>

            <nav className="grid gap-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-[#183b86] hover:bg-blue-50"
                >
                  <span className="w-7 text-center text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="mt-2 flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-900"
                >
                  <span className="w-7 text-center text-xl">♛</span>
                  Admin Dashboard
                </Link>
              )}
            </nav>

            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                const { error } = await supabase.auth.signOut();
                if (!error) window.location.assign("/login");
              }}
              className="mt-6 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700"
            >
              Log out
            </button>
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-blue-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-lg">
        {[
          { href: "/dashboard", label: "Home", icon: "⌂" },
          { href: "/invest", label: "Invest", icon: "▥" },
          { href: "/transactions", label: "History", icon: "◷" },
          { href: "/support", label: "Support", icon: "♧" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 py-2 text-blue-800"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-2 text-blue-800"
        >
          <span className="text-xl">⚙</span>
          <span className="text-[10px] font-semibold">Settings</span>
        </button>
      </nav>
    </div>
  );
           }
