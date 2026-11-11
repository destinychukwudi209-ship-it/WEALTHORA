
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || email.length > 254) {
      return NextResponse.json(
        { message: "If this account is eligible, recovery instructions will be sent." },
        { status: 200 }
      );
    }

    const admin = await createAdminClient();

    let matchedUser: { id: string; email?: string } | null = null;

    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error || !data) break;

      matchedUser =
        data.users.find(
          (user) => user.email?.toLowerCase() === email
        ) || null;

      if (matchedUser || data.users.length < 1000) break;
    }

    if (!matchedUser) {
      return NextResponse.json({
        message: "If this account is eligible, recovery instructions will be sent.",
      });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("status")
      .eq("id", matchedUser.id)
      .maybeSingle();

    if (
      !profile ||
      ["suspended", "frozen", "closed"].includes(profile.status) ||
      profile.status !== "active"
    ) {
      return NextResponse.json({
        message: "If this account is eligible, recovery instructions will be sent.",
      });
    }

    const recoveryClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await recoveryClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/callback`,
    });

    if (error) {
      console.error("Password recovery request failed:", error.message);
    }

    return NextResponse.json({
      message: "If this account is eligible, recovery instructions will be sent.",
    });
  } catch (error) {
    console.error("Password recovery error:", error);

    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 }
    );
  }
  }
