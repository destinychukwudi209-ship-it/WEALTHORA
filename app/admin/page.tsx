
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";

export const dynamic = "force-dynamic";

const modules = [
  { name: "KYC review", description: "Review customer identity verification.", href: null },
  { name: "Deposit approvals", description: "Review and process customer deposit requests.", href: null },
  { name: "Withdrawal approvals", description: "Review customer withdrawal requests.", href: null },
  { name: "Investment products", description: "Manage available investment plans.", href: null },
  { name: "Referral review", description: "Review referral activity and commissions.", href: null },
  { name: "Promo campaigns", description: "Manage promotional campaigns.", href: null },
  { name: "Announcements", description: "Publish platform announcements.", href: null },
  { name: "Support inbox", description: "Manage customer support requests.", href: null },
  { name: "Fraud monitoring", description: "Review suspicious account activity.", href: null },
  { name: "Financial reconciliation", description: "Review and reconcile financial records.", href: null },
  { name: "Audit logs", description: "Review administrative activity records.", href: null },
  { name: "Roles & permissions", description: "Review staff roles and access permissions.", href: null },
  { name: "System health", description: "Monitor platform status and system operations.", href: null },
];

export default async function Admin() {
  const { user, profile } = await requireAdmin();

  return (
    <Shell>
      <PageTitle
        title="Admin Control Centre"
        subtitle="Welcome to your WEALTHORA administrative workspace."
      />

      <div className="mb-6 rounded-2xl border border-lime-500/40 bg-[#10291a] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-lime-300">
          Administrator account
        </p>
        <h2 className="mt-3 text-lg font-extrabold text-white">
          {user.email}
        </h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-lime-400/10 px-3 py-2 text-lime-300">
            Role: {profile.role}
          </span>
          <span className="rounded-full bg-green-400/10 px-3 py-2 text-green-300">
            Status: {profile.status}
          </span>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-200">
        Authorized staff only. Sensitive administrative actions must be
        permission-checked and audited.
      </div>

      <h2 className="mb-4 text-lg font-bold text-white">
        Administrative modules
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-lime-500/40 bg-[#10291a] p-5 transition hover:border-lime-300"
        >
          <h3 className="font-bold text-lime-300">Admin Settings</h3>
          <p className="mt-2 text-xs text-gray-300">
            Manage platform details and administrator notification preferences.
          </p>
          <p className="mt-4 text-sm font-bold text-white">
            Open admin settings →
          </p>
        </Link>

        <Link
          href="/admin/deposit-accounts"
          className="rounded-2xl border border-lime-500/40 bg-[#10291a] p-5 transition hover:border-lime-300"
        >
          <h3 className="font-bold text-lime-300">Deposit bank accounts</h3>
          <p className="mt-2 text-xs text-gray-300">
            View and manage deposit account information.
          </p>
          <p className="mt-4 text-sm font-bold text-white">
            Open deposit accounts →
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl border border-lime-500/40 bg-[#10291a] p-5 transition hover:border-lime-300"
        >
          <h3 className="font-bold text-lime-300">User management</h3>
          <p className="mt-2 text-xs text-gray-300">
            View customer accounts and manage their account status.
          </p>
          <p className="mt-4 text-sm font-bold text-white">
            Open user management →
          </p>
        </Link>

        {modules.map((module) => (
          <div
            key={module.name}
            className="rounded-2xl border border-[#24452b] bg-[#09170e] p-5"
          >
            <h3 className="font-bold text-white">{module.name}</h3>
            <p className="mt-2 text-xs text-gray-400">
              {module.description}
            </p>
            <p className="mt-4 text-xs font-semibold text-lime-300">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </Shell>
  );
}
