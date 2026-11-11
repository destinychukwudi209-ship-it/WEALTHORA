
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/admin";

const allowedStatuses = [
  "active",
  "suspended",
  "frozen",
  "closed",
] as const;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify signed-in administrator.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Please sign in again." },
        { status: 401 }
      );
    }

    // Check administrator permissions.
    const { data: adminProfile, error: adminError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      adminError ||
      !adminProfile ||
      !["admin", "super_admin"].includes(adminProfile.role)
    ) {
      return NextResponse.json(
        { message: "You are not authorized to manage accounts." },
        { status: 403 }
      );
    }

    // Read request body.
    let body: {
      userId?: unknown;
      status?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const targetUserId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const newStatus =
      typeof body.status === "string"
        ? body.status
        : "";

    if (
      !targetUserId ||
      targetUserId === user.id ||
      !allowedStatuses.includes(
        newStatus as (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        { message: "Invalid customer account or status." },
        { status: 400 }
      );
    }

    // Create server-side admin client.
    const admin = await createAdminClient();

    // Update customer profile.
    const { data: updated, error: updateError } =
      await admin
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", targetUserId)
        .eq("role", "customer")
        .select("id, role, status")
        .maybeSingle();

    if (updateError) {
      console.error("STATUS UPDATE DIAGNOSTIC:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      });

      return NextResponse.json(
        {
          message:
            `Database error ${updateError.code}: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        {
          message:
            "No matching customer profile was updated. Check the customer ID and role.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Customer account status updated successfully.",
      userId: updated.id,
      status: updated.status,
    });
  } catch (error) {
    console.error("Admin status API error:", error);

    return NextResponse.json(
      { message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
      }
      
