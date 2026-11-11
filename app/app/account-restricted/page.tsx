
import Link from "next/link";
import {
  ShieldAlert,
  Snowflake,
  LockKeyhole,
  CircleX,
  Headset,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

type RestrictionStatus = "suspended" | "frozen" | "closed";

const restrictionDetails: Record<
  RestrictionStatus,
  {
    title: string;
    subtitle: string;
    description: string;
    detail: string;
    icon: typeof ShieldAlert;
    statusLabel: string;
  }
> = {
  suspended: {
    title: "Account Suspended",
    subtitle: "Your account access has been suspended.",
    description:
      "Your WEALTHORA account has been suspended by an authorized administrator.",
    detail:
      "You cannot access your account or use platform services while this restriction remains active. Please contact our support team for assistance.",
    icon: ShieldAlert,
    statusLabel: "SUSPENDED",
  },

  frozen: {
    title: "Account Frozen",
    subtitle: "Your account is temporarily restricted.",
    description:
      "Your WEALTHORA account has been temporarily frozen.",
    detail:
      "Account access and platform activities are restricted until an authorized administrator reviews your account and restores access.",
    icon: Snowflake,
    statusLabel: "FROZEN",
  },

  closed: {
    title: "Account Closed",
    subtitle: "Your account has been closed.",
    description:
      "Your WEALTHORA account has been closed by an authorized administrator.",
    detail:
      "You can no longer use this account to access WEALTHORA. If you believe this decision was made in error, contact our support team for a review.",
    icon: CircleX,
    statusLabel: "CLOSED",
  },
};

export default async function AccountRestrictedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const status: RestrictionStatus =
    params.status === "frozen" || params.status === "closed"
      ? params.status
      : "suspended";

  const details = restrictionDetails[status];
  const StatusIcon = details.icon;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#b7ff35]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#293b27] bg-[#0e1712] p-6 shadow-2xl shadow-black/40 sm:p-10">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#b7ff35]/30 bg-[#b7ff35]/10 text-3xl font-black text-[#b7ff35] shadow-lg shadow-[#b7ff35]/10">
            W
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[0.08em]">
            <span className="text-[#b7ff35]">WEALTH</span>ORA
          </h1>

          <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-[#929b94]">
            BUILDING WEALTH WITH TRUST
          </p>
        </header>

        <div className="mx-auto my-9 flex h-40 w-40 items-center justify-center rounded-full border border-[#293b27] bg-[#101d15]">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#b7ff35]/40 bg-[#b7ff35]/10 shadow-lg shadow-[#b7ff35]/10">
            <StatusIcon className="h-14 w-14 text-[#b7ff35]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#b7ff35]/30 bg-[#b7ff35]/10 px-4 py-5 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#b7ff35]">
            ACCOUNT RESTRICTION
          </p>

          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {details.title}
          </h2>

          <p className="mt-2 text-sm font-semibold text-[#b7ff35]">
            {details.subtitle}
          </p>
        </div>

        <div className="mt-7 text-center">
          <p className="text-base font-semibold leading-7 text-white">
            {details.description}
          </p>

          <p className="mt-3 text-sm leading-7 text-[#929b94]">
            {details.detail}
          </p>
        </div>

        <div className="mt-7 flex gap-3 rounded-2xl border border-[#293b27] bg-[#101d15] p-4">
          <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-[#b7ff35]" />

          <div>
            <p className="font-bold text-white">
              Account Access Restricted
            </p>
            <p className="mt-1 text-sm leading-6 text-[#929b94]">
              Only an authorized WEALTHORA administrator can restore access.
            </p>
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-sm leading-6 text-[#929b94]">
            Need help? Contact WEALTHORA Support for assistance.
          </p>

          <a
            href="mailto:wealthora.support@gmail.com?subject=WEALTHORA%20Account%20Restriction%20Review"
            className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#b7ff35] px-6 py-4 font-bold text-[#071006] shadow-lg shadow-[#b7ff35]/10 transition hover:brightness-110"
          >
            <Headset className="h-5 w-5" />
            Contact Support
          </a>

          <p className="mt-5 text-xs font-semibold tracking-widest text-[#929b94]">
            WEALTHORA SUPPORT TEAM
          </p>
        </div>

        <div className="mt-8 border-t border-[#293b27] pt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#b7ff35] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#647067]">
          <ShieldCheck className="h-4 w-4 text-[#b7ff35]" />
          WEALTHORA ACCOUNT SECURITY
        </div>
      </section>
    </main>
  );
}
