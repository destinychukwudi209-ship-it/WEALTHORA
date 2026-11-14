
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=google_signin_failed", origin)
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL("/login?error=google_signin_failed", origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=google_signin_failed", origin)
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=account_not_verified", origin)
    );
  }

  const status = String(profile.status || "").toLowerCase();

  if (["suspended", "frozen", "closed"].includes(status)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(
        `/app/account-restricted?status=${encodeURIComponent(status)}`,
        origin
      )
    );
  }

  if (status !== "active") {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=account_not_active", origin)
    );
  }

  const adminRoles = ["admin", "super_admin", "finance", "support"];
  const destination = adminRoles.includes(profile.role)
    ? "/admin"
    : "/dashboard";

  return NextResponse.redirect(new URL(destination, origin));
                                                             }
