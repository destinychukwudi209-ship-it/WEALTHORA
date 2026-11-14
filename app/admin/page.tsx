
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import AdminSettingsForm from "./admin-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { user, profile } = await requireAdmin();

  return (
    <Shell>
      <PageTitle
        title="Admin Settings"
        subtitle="Manage your administrator account and WEALTHORA platform settings."
      />

      <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl font-black text-blue-700">
            W<span className="text-amber-500">↗</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              WEALTHORA
            </p>
            <h2 className="text-lg font-extrabold text-slate-900">
              Administrator Account
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Signed-in administrator
          </p>
          <h3 className="mt-2 break-all text-base font-bold text-slate-900">
            {user.email}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-blue-100 bg-white px-3 py-2 text-blue-700">
              {profile.role}
            </span>
            <span className="rounded-full border border-emerald-100 bg-white px-3 py-2 text-emerald-700">
              {profile.status}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          Secure administrator access for the WEALTHORA platform.
        </p>
      </div>

      <AdminSettingsForm />
    </Shell>
  );
}
