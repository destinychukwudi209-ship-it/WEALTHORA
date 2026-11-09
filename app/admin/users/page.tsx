
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import UserManagement from "./user-management";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user, profile } = await requireAdmin();

  return (
    <Shell>
      <PageTitle
        title="User Management"
        subtitle="View customer accounts and manage their account status."
      />

      <UserManagement
        currentUserId={user.id}
        currentRole={profile.role}
      />
    </Shell>
  );
}
