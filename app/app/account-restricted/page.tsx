
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
    accent: string;
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
    accent: "amber",
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
    accent: "blue",
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
    accent: "red",
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

  const accentStyles = {
    amber: {
      icon: "bg-amber-50 text-amber-600 border-amber-100",
      label: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-500",
    },
    blue: {
      icon: "bg-blue-50 text-[#1646C8] border-blue-100",
      label: "bg-blue-50 text-[#1646C8] border-blue-100",
      dot: "bg-blue-600",
    },
    red: {
      icon: "bg-red-50 text-red-600 border-red-100",
      label: "bg-red-50 text-red-700 border-red-100",
      dot: "bg-red-500",
    },
  }[details.accent];

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F7FF] px-4 py-10 text-[#102C70]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(22,70,200,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(22,70,200,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl" />

      <section className="relative w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white bg-white px-6 py-8 shadow-xl shadow-blue-100/80 sm:px-10 sm:py-10">
        <header className="text-center">
          <Link href="/" className="flex flex-col items-center">
            <span className="text-5xl font-black italic text-[#1646C8]">
              W<span className="text-[#F5B82E]">↗</span>
            </span>

            <span className="mt-1 text-3xl font-black tracking-tight text-[#102C70]">
              WEALTHORA
            </span>

            <span className="mt-1 text-xs font-bold tracking-[0.25em] text-slate-500">
              INVEST • EARN • GROW
            </span>
          </Link>
        </header>

        <div className="mx-auto my-9 flex h-36 w-36 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full border ${accentStyles.icon}`}
          >
            <StatusIcon className="h-12 w-12" />
          </div>
        </div>

        <div className="text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold tracking-widest ${accentStyles.label}`}
          >
            <span className={`h-2 w-2 rounded-full ${accentStyles.dot}`} />
            {details.statusLabel}
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {details.title}
          </h1>

          <p className="mt-3 text-base font-semibold text-[#1646C8]">
            {details.subtitle}
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-base font-bold leading-7 text-slate-800">
            {details.description}
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {details.detail}
          </p>
        </div>

        <div className="mt-5 flex gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
          <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-[#1646C8]" />

          <div>
            <p className="font-extrabold text-[#102C70]">
              Account Access Restricted
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Only an authorized WEALTHORA administrator can restore account access.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm leading-6 text-slate-500">
            Need help or believe this restriction was made in error?
            Contact WEALTHORA Support for assistance.
          </p>

          <a
            href="mailto:wealthora.support@gmail.com?subject=WEALTHORA%20Account%20Restriction%20Review"
            className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1646C8] px-6 py-5 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
          >
            <Headset className="h-5 w-5" />
            Contact Support
          </a>

          <p className="mt-5 text-xs font-bold tracking-widest text-slate-400">
            WEALTHORA SUPPORT TEAM
          </p>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1646C8] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-[#1646C8]" />
          WEALTHORA ACCOUNT SECURITY
        </div>
      </section>
    </main>
  );
    }
            
