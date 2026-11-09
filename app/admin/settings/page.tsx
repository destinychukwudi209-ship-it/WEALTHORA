
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

      <div className="mb-6 rounded-2xl border border-lime-500/40 bg-[#10291a] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-lime-300">
          Signed-in administrator
        </p>
        <h2 className="mt-3 text-lg font-extrabold text-white">
          {user.email}
        </h2>
        <div className="mt-3 flex gap-3 text-sm">
          <span className="rounded-full bg-lime-400/10 px-3 py-2 text-lime-300">
            {profile.role}
          </span>
          <span className="rounded-full bg-green-400/10 px-3 py-2 text-green-300">
            {profile.status}
          </span>
        </div>
      </div>

      <AdminSettingsForm />
    </Shell>
  );
}
