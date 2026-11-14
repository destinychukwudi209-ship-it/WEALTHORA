
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "WEALTHORA Customer";

  const email = user?.email || "Not available";

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.profile_image_url ||
    null;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold tracking-widest text-blue-100">
            WEALTHORA ACCOUNT
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">
            My Profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-blue-50">
            View your account information and profile details.
          </p>
        </section>

        {!user ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              Please sign in to view your profile.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
            >
              Sign in
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Your profile"
                    className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-600 text-2xl font-extrabold text-white">
                    {initials || "W"}
                  </div>
                )}

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-extrabold text-[#092b79]">
                    {fullName}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {email}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    WEALTHORA Account
                  </span>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <div className="border-b border-blue-100 p-5">
                <h2 className="font-extrabold text-[#092b79]">
                  Personal account information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Information currently available from your signed-in account.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-500">
                    Full name
                  </p>
                  <p className="mt-2 break-words font-bold text-slate-900">
                    {fullName}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-500">
                    Email address
                  </p>
                  <p className="mt-2 break-all font-bold text-slate-900">
                    {email}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-500">
                    Account created
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {joinedDate}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-500">
                    Email confirmation
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {user.email_confirmed_at ? "Confirmed" : "Not confirmed"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="font-extrabold text-[#092b79]">
                Account settings
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage your account security and available preferences.
              </p>
              <Link
                href="/settings"
                className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
              >
                Open settings
              </Link>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="font-bold text-[#092b79]">
                Need assistance?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Contact the WEALTHORA support team if you need help with your account.
              </p>
              <Link
                href="/support"
                className="mt-4 inline-block text-sm font-bold text-blue-700 underline"
              >
                Contact support
              </Link>
            </section>
          </>
        )}

        <footer className="pb-5 text-center text-xs text-slate-400">
          WEALTHORA · Your account
        </footer>
      </main>
    </DashboardShell>
  );
                  }
