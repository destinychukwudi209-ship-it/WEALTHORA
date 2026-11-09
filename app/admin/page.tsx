
import { createClient } from "@/lib/supabase/server";
import { Shell, PageTitle } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function AdminDiagnostic() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  let profile = null;
  let profileError = null;

  if (user) {
    const result = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    profile = result.data;
    profileError = result.error;
  }

  return (
    <Shell>
      <PageTitle
        title="WEALTHORA Admin Diagnostic"
        subtitle="Checking your administrator account permissions."
      />

      <div className="space-y-4">
        <div className="rounded-xl border border-green-500/40 bg-green-950/30 p-5">
          <h2 className="font-bold text-white">Signed-in account</h2>
          <p className="mt-3 text-sm text-gray-300">
            Email: {user?.email ?? "No signed-in user"}
          </p>
          <p className="mt-2 text-sm text-gray-300">
            User ID: {user?.id ?? "Unavailable"}
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Authentication: {authError ? authError.message : user ? "Successful" : "Not signed in"}
          </p>
        </div>

        <div className="rounded-xl border border-lime-500/40 bg-[#10291a] p-5">
          <h2 className="font-bold text-white">Profile permissions</h2>

          <p className="mt-3 text-sm text-gray-300">
            Role: {profile?.role ?? "Not found"}
          </p>

          <p className="mt-2 text-sm text-gray-300">
            Status: {profile?.status ?? "Not found"}
          </p>

          <p className="mt-2 text-sm text-gray-300">
            Profile ID: {profile?.id ?? "Not found"}
          </p>

          <p className="mt-3 break-words text-sm text-red-300">
            Profile error: {profileError?.message ?? "None"}
          </p>
        </div>
      </div>
    </Shell>
  );
}
