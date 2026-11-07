
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/wallet", label: "Wallet", icon: "◈" },
  { href: "/invest", label: "Investments", icon: "↗" },
  { href: "/transactions", label: "Transactions", icon: "⇄" },
  { href: "/referrals", label: "Referrals", icon: "♧" },
  { href: "/promos", label: "Promo codes", icon: "％" },
  { href: "/notifications", label: "Notifications", icon: "♢" },
  { href: "/support", label: "Support", icon: "?" },
  { href: "/profile", label: "My profile", icon: "◎" },
  { href: "/settings", label: "Security & settings", icon: "⚙" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function activeLink(href: string) {
    return pathname === href
      ? "bg-emerald-900 text-white shadow-lg"
      : "text-slate-300 hover:bg-slate-800 hover:text-white";
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-900/40 bg-[#071b13] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/40 bg-emerald-900 text-xl font-bold text-amber-300">
              W
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-[0.18em]">
                WEALTHORA
              </span>
              <span className="block text-[9px] tracking-[0.22em] text-amber-300">
                BUILDING WEALTH WITH TRUST
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-emerald-700 px-3 py-2 text-xs text-emerald-200">
              Secure customer portal
            </span>
            <Link
              href="/profile"
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
            >
              My account
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-semibold text-amber-300 md:hidden"
          >
            {menuOpen ? "Close ✕" : "Menu ☰"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 border-r border-slate-200 bg-[#0b2118] p-4 md:block">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Main navigation
          </p>

          <nav className="grid gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  pathname === item.href ? "page" : undefined
                }
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activeLink(item.href)}`}
              >
                <span className="w-6 text-center text-lg text-amber-300">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-emerald-800 bg-emerald-950/60 p-4">
            <p className="text-sm font-semibold text-amber-300">
              WEALTHORA SECURITY
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-100/70">
              Protect your account. Never share your password or verification codes.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={closeMenu}
            className="absolute inset-0 h-full w-full"
          />

          <section className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-emerald-700 bg-[#0b2118] p-5 pb-8 text-white shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-emerald-600" />

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-wider">
                  WEALTHORA MENU
                </h2>
                <p className="text-xs text-emerald-300">
                  Your account navigation
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg border border-emerald-700 px-3 py-2 text-sm text-amber-300"
              >
                Close ✕
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex min-h-16 items-center gap-3 rounded-xl border border-emerald-800 p-3 text-sm font-medium ${activeLink(item.href)}`}
                >
                  <span className="text-xl text-amber-300">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="mt-6 text-center text-xs text-emerald-300/70">
              WEALTHORA • Building wealth with trust
            </p>
          </section>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
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
              pathname === item.href
                ? "text-emerald-800"
                : "text-slate-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold text-slate-500"
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
      <h1 className="text-2xl font-extrabold tracking-tight text-[#0b2118] sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}
  
