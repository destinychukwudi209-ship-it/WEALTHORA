
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !email ||
      email.length > 254 ||
      !/^\d{6}$/.test(otp) ||
      password.length < 12 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return NextResponse.json(
        { message: "Invalid recovery details or password." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Supabase configuration is missing.");
    }

    const recoveryClient = createSupabaseClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: recoveryData, error: recoveryError } =
      await recoveryClient.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

    if (recoveryError || !recoveryData.user) {
      return NextResponse.json(
        { message: "The recovery code is invalid or expired." },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("status")
      .eq("id", recoveryData.user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.status !== "active"
    ) {
      return NextResponse.json(
        {
          message:
            "This account is restricted. Password recovery is unavailable. Contact WEALTHORA Support.",
        },
        { status: 403 }
      );
    }

    const { error: updateError } =
      await admin.auth.admin.updateUserById(recoveryData.user.id, {
        password,
      });

    if (updateError) {
      console.error("Password update failed:", updateError.message);

      return NextResponse.json(
        { message: "Password update failed. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      { message: "Unable to complete password recovery right now." },
      { status: 500 }
    );
  }
         }
