
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    redirect("/login");
  }

  if (["suspended", "frozen", "closed"].includes(profile.status)) {
    redirect(
      `/account-restricted?status=${encodeURIComponent(profile.status)}`
    );
  }

  if (profile.status !== "active") {
    redirect("/login");
  }

  return { supabase, user, profile };
}

export async function requireAdmin() {
  const { supabase, user, profile } = await requireUser();

  if (
    !["admin", "super_admin", "finance", "support"].includes(profile.role)
  ) {
    redirect("/dashboard");
  }

  return { supabase, user, profile };
}
