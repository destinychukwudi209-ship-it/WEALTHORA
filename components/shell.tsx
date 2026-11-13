
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/wallet", label: "Wallet", icon: "◈" },
  { href: "/invest", label: "Investments", icon: "↗" },
  { href: "/tasks", label: "My Tasks", icon: "✓" },
  { href: "/transactions", label: "Transactions", icon: "⇄" },
  { href: "/referrals", label: "Referrals", icon: "♧" },
  { href: "/promos", label: "Promo codes", icon: "％" },
  { href: "/notifications", label: "Notifications", icon: "♢" },
  { href: "/support", label: "Support", icon: "?" },
  { href: "/profile", label: "My profile", icon: "◎" },
  { href: "/settings", label: "Security & settings", icon: "⚙" },
];

const adminLink = {
  href: "/admin",
  label: "Admin dashboard",
  icon: "♛",
};

const withdrawalLink = {
  href: "/admin/withdrawals",
  label: "Withdrawal Management",
  icon: "⇧",
};

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageWithdrawals, setCanManageWithdrawals] = useState(false);

  const visibleLinks = isAdmin
    ? [
        ...links,
        adminLink,
        ...(canManageWithdrawals ? [withdrawalLink] : []),
      ]
    : links;

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setIsAdmin(false);
          setCanManageWithdrawals(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      const allowedRoles = ["admin", "super_admin", "finance", "support"];

      if (active) {
        const activeAdmin =
          !error &&
          !!profile &&
          allowedRoles.includes(profile.role) &&
          profile.status === "active";

        setIsAdmin(activeAdmin);

        setCanManageWithdrawals(
          activeAdmin &&
            ["admin", "super_admin"].includes(profile?.role ?? "")
        );
      }
    }

    checkAdmin();

    function updateConnection() {
      setIsOnline(navigator.onLine);
    }

    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    return () => {
      active = false;
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Unable to log out. Please try again.");
        setLoggingOut(false);
        return;
      }

      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      alert("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }

  function activeLink(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
      ? "bg-[#b7ff35] text-[#071b10] shadow-lg shadow-lime-400/10"
      : "text-gray-300 hover:bg-[#173c25] hover:text-white";
  }

  return (
    <div className="min-h-screen bg-[#050806] text-white">
      {!isOnline && (
        <div
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#050806] px-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#426b37] bg-[#09170e] p-8 shadow-2xl">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-red-400/40 bg-red-500/10 text-4xl">
              📡
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              You are offline
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Your internet connection is not available. Please turn on your
              mobile data or connect to Wi-Fi to continue using WEALTHORA.
            </p>
            <div className="mt-6 rounded-xl border border-[#31583a] bg-[#10291a] p-4">
              <p className="text-sm font-bold text-[#b7ff35]">
                Connection required
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-400">
                WEALTHORA will become available again when your device reports
                that it is online.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(navigator.onLine)}
              className="mt-6 w-full rounded-xl bg-[#b7ff35] px-5 py-4 font-extrabold text-[#071b10]"
            >
              Check connection again
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#24452b] bg-[#071b10]/95 text-white shadow-lg shadow-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-lime-300/40 bg-[#173c25] text-xl font-black text-[#b7ff35]">
              W
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-[0.18em]">
                WEALTHORA
              </span>
              <span className="block text-[9px] tracking-[0.22em] text-[#b7ff35]">
                BUILDING WEALTH WITH TRUST
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-[#31583a] px-3 py-2 text-xs text-lime-200">
              {isAdmin ? "Administrator portal" : "Secure customer portal"}
            </span>
            <Link
              href="/profile"
              className="rounded-xl bg-[#b7ff35] px-4 py-2 text-sm font-bold text-[#071b10] transition hover:bg-lime-300"
            >
              My account
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-bold text-red-400 disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-xl border border-[#426b37] px-4 py-2 text-sm font-semibold text-[#b7ff35] md:hidden"
          >
            {menuOpen ? "Close ✕" : "Menu ☰"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 border-r border-[#1c3824] bg-[#09170e] p-4 md:block">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b7ff35]">
            Main navigation
          </p>
          <nav className="grid gap-2">
            {visibleLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeLink(item.href)}`}
              >
                <span className="w-6 text-center text-lg text-[#b7ff35]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-[#31583a] bg-[#10291a] p-4">
            <p className="text-sm font-bold text-[#b7ff35]">
              WEALTHORA SECURITY
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-300">
              Protect your account. Never share your password or verification
              codes.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#050806] px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={closeMenu}
            className="absolute inset-0 h-full w-full"
          />
          <section className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#426b37] bg-[#09170e] p-5 pb-8 text-white shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#b7ff35]" />
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold tracking-wider">
                  WEALTHORA MENU
                </h2>
                <p className="text-xs text-lime-300">
                  Your account navigation
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg border border-[#426b37] px-3 py-2 text-sm text-[#b7ff35]"
              >
                Close ✕
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-3">
              {visibleLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex min-h-16 items-center gap-3 rounded-xl border border-[#24452b] p-3 text-sm font-semibold ${activeLink(item.href)}`}
                >
                  <span className="text-xl text-[#b7ff35]">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-5 w-full rounded-xl bg-red-600 px-4 py-4 font-bold text-white disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
            <p className="mt-6 text-center text-xs text-gray-400">
              WEALTHORA • Building wealth with trust
            </p>
          </section>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-[#24452b] bg-[#09170e]/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] backdrop-blur md:hidden">
        {[
          { href: "/dashboard", label: "Home", icon: "⌂" },
          { href: "/wallet", label: "Wallet", icon: "◈" },
          { href: "/invest", label: "Invest", icon: "↗" },
          { href: "/transactions", label: "History", icon: "⇄" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${
              pathname === item.href ? "text-[#b7ff35]" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold text-gray-400"
        >
          <span className="text-xl">☰</span>
          More
        </button>
      </nav>
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-gray-400 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
        }
            
