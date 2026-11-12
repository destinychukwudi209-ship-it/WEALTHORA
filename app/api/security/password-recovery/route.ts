
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const GENERIC_MESSAGE =
  "If this account is eligible, a recovery code will be sent.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration is missing.");
    }

    const admin = await createAdminClient();

    let matchedUser: { id: string; email?: string } | null = null;

    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error || !data) {
        console.error(
          "Unable to check recovery account:",
          error?.message
        );
        break;
      }

      matchedUser =
        data.users.find(
          (user) => user.email?.toLowerCase() === email
        ) || null;

      if (matchedUser || data.users.length < 1000) {
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("status")
      .eq("id", matchedUser.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.status !== "active"
    ) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const recoveryClient = createSupabaseClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: recoveryError } =
      await recoveryClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${request.nextUrl.origin}/forgot-password`,
      });

    if (recoveryError) {
      console.error(
        "Password recovery email failed:",
        recoveryError.message
      );
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Password recovery error:", error);

    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 }
    );
  }
}
  
