
import Link from "next/link";
import {
  ShieldAlert,
  UserRoundX,
  Headset,
  LockKeyhole,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type RestrictionStatus = "suspended" | "frozen" | "closed";

const restrictionDetails: Record<
  RestrictionStatus,
  { title: string; description: string; detail: string }
> = {
  suspended: {
    title: "Account Suspended",
    description:
      "Your WEALTHORA account has been suspended by an administrator.",
    detail:
      "You cannot sign in, use the platform, register again with this email, or reset your password while this restriction remains active.",
  },
  frozen: {
    title: "Account Frozen",
    description:
      "Your WEALTHORA account has temporarily been frozen.",
    detail:
      "Account access and platform activities are restricted until an authorized administrator reviews and restores your account.",
  },
  closed: {
    title: "Account Closed",
    description:
      "Your WEALTHORA account has been closed by an administrator.",
    detail:
      "This account can no longer be used to access WEALTHORA. Contact our support team if you believe this decision was made in error.",
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-10 text-[#14213d]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white bg-white p-6 shadow-[0_25px_90px_rgba(20,33,61,0.12)] sm:p-10">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-purple-950 text-4xl font-black text-white shadow-lg">
            W
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#14213d]">
            WEALTHORA
          </h1>
          <p className="mt-1 text-sm font-semibold tracking-wide text-purple-700">
            INVEST. EARN. GROW.
          </p>
        </header>

        <div className="mx-auto my-9 flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-purple-50">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[9px] border-red-500 bg-white shadow-inner">
            <UserRoundX className="h-16 w-16 text-[#14213d]" />
            <div className="absolute -right-5 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-red-600 text-white shadow-lg">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-5 text-center shadow-lg shadow-red-200">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {details.title}
          </h2>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-bold leading-7 text-[#14213d]">
            {details.description}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {details.detail}
          </p>
        </div>

        <div className="mt-7 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-red-600" />
          <p className="text-sm font-semibold leading-6 text-red-800">
            Access is restricted. Only an authorized WEALTHORA administrator
            can restore an account.
          </p>
        </div>

        <div className="mt-7 text-center">
          <p className="text-sm leading-6 text-slate-600">
            Believe this is a mistake? Contact WEALTHORA Support for assistance.
          </p>

          <a
            href="mailto:wealthora.support@gmail.com?subject=WEALTHORA%20Account%20Restriction%20Review"
            className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-800 to-purple-600 px-6 py-4 font-bold text-white shadow-lg shadow-purple-200 transition hover:brightness-110"
          >
            <Headset className="h-5 w-5" />
            Contact Support
          </a>

          <p className="mt-5 text-xs font-semibold text-slate-500">
            WEALTHORA SUPPORT TEAM
          </p>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
  
