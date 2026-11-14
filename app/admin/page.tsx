
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const modules = [
  {
    name: "KYC Review",
    description: "Review customer identity verification.",
    href: null,
    icon: "◎",
  },
  {
    name: "Deposit Approvals",
    description: "Review customer deposit requests and receipts.",
    href: "/admin/deposits",
    icon: "＋",
  },
  {
    name: "Withdrawal Approvals",
    description: "Review customer withdrawal requests.",
    href: "/admin/withdrawals",
    icon: "↗",
  },
  {
    name: "Investment Products",
    description: "Manage available investment plans.",
    href: null,
    icon: "▥",
  },
  {
    name: "Referral Review",
    description: "Review referral activity and commissions.",
    href: null,
    icon: "♧",
  },
  {
    name: "Promo Campaigns",
    description: "Create and manage promotional campaigns.",
    href: "/admin/promos",
    icon: "✦",
  },
  {
    name: "Announcements",
    description: "Publish platform announcements.",
    href: "/admin/notifications",
    icon: "♢",
  },
  {
    name: "Support Inbox",
    description: "View customer tickets and support requests.",
    href: "/admin/support",
    icon: "◉",
  },
  {
    name: "Fraud Monitoring",
    description: "Review suspicious account activity.",
    href: null,
    icon: "⌕",
  },
  {
    name: "Financial Reconciliation",
    description: "Review financial records.",
    href: null,
    icon: "₦",
  },
  {
    name: "Audit Logs",
    description: "Review administrative activity records.",
    href: null,
    icon: "▤",
  },
  {
    name: "Roles & Permissions",
    description: "Review staff roles and permissions.",
    href: null,
    icon: "♙",
  },
  {
    name: "System Health",
    description: "Monitor platform status and operations.",
    href: null,
    icon: "⚙",
  },
];

const quickLinks = [
  {
    name: "Admin Settings",
    description: "Manage platform settings and admin preferences.",
    href: "/admin/settings",
    icon: "⚙",
  },
  {
    name: "Deposit Bank Accounts",
    description: "View and manage deposit account information.",
    href: "/admin/deposit-accounts",
    icon: "▣",
  },
  {
    name: "Admin Users",
    description: "View customer accounts and manage account status.",
    href: "/admin/users",
    icon: "♙",
  },
];

function AdminCard({
  name,
  description,
  href,
  icon,
}: {
  name: string;
  description: string;
  href: string | null;
  icon: string;
}) {
  const content = (
    <>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">
        {icon}
      </div>
      <h3 className="font-bold text-[#173675]">{name}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-bold text-blue-700">
        {href ? "Open section →" : "Coming soon"}
      </p>
    </>
  );

  return href ? (
    <Link
      href={href}
      className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      {content}
    </Link>
  ) : (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
}

export default async function Admin() {
  const { user, profile } = await requireAdmin();

  if (
    !["admin", "super_admin"].includes(profile.role) ||
    profile.status !== "active"
  ) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f8ff] px-4 py-6 text-[#173675]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <Link href="/admin" className="text-xl font-black text-blue-800">
            WEALTHORA
            <span className="block text-[9px] tracking-widest">
              ADMINISTRATION
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800"
          >
            Customer Dashboard
          </Link>
        </header>

        <section className="mb-7 rounded-3xl bg-gradient-to-r from-[#e4efff] to-[#e5f5ff] p-6">
          <p className="text-sm font-semibold text-blue-700">
            WEALTHORA ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#153675]">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-blue-800">
            Welcome to your administrative control centre.
          </p>
        </section>

        <section className="mb-7 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Administrator account
          </p>

          <h2 className="mt-3 break-all text-lg font-extrabold text-[#173675]">
            {user.email}
          </h2>

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-blue-50 px-3 py-2 font-semibold text-blue-800">
              Role: {profile.role}
            </span>
            <span className="rounded-full bg-green-50 px-3 py-2 font-semibold text-green-700">
              Status: {profile.status}
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-extrabold text-[#173675]">
            Quick Management
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => (
              <AdminCard key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-extrabold text-[#173675]">
            Administrative Modules
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => (
              <AdminCard key={item.name} {...item} />
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Authorized administrators only. Sensitive administrative actions
          must remain permission-checked and audited.
        </div>
      </div>
    </main>
  );
                   }
