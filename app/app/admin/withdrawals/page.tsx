
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";
import WithdrawalManagement from "./withdrawal-management";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawalsPage() {
  const { user, profile } = await requireAdmin();

  // Only active admins and super admins can manage withdrawals.
  if (
    !["admin", "super_admin"].includes(profile.role) ||
    profile.status !== "active"
  ) {
    redirect("/dashboard");
  }

  return (
    <Shell>
      <PageTitle
        title="Withdrawal Management"
        subtitle="Review, approve, reject and record customer withdrawal payments."
      />

      <WithdrawalManagement currentUserId={user.id} />
    </Shell>
  );
}
