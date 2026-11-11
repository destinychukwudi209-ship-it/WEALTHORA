
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
    // Verify the signed-in user.
    const supabase = await createClient();

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

    // Verify that the signed-in user is an authorized administrator.
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
        {
          message: "You are not authorized to manage accounts.",
        },
        { status: 403 }
      );
    }

    // Read and validate the request.
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
        {
          message: "Invalid customer account or status.",
        },
        { status: 400 }
      );
    }

    // Use the service-role client only after admin verification.
    const admin = await createAdminClient();

    // Confirm that the target is a customer account.
    const { data: target, error: targetError } =
      await admin
        .from("profiles")
        .select("id, role")
        .eq("id", targetUserId)
        .maybeSingle();

    if (targetError) {
      console.error(
        "Target account lookup failed:",
        targetError.message
      );

      return NextResponse.json(
        { message: "Unable to find the customer account." },
        { status: 500 }
      );
    }

    if (!target || target.role !== "customer") {
      return NextResponse.json(
        { message: "Customer account not found." },
        { status: 404 }
      );
    }

    // Update the customer's account status.
    const { data: updated, error: updateError } =
      await admin
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", targetUserId)
        .eq("role", "customer")
        .select("id")
        .maybeSingle();

    if (updateError || !updated) {
      console.error(
        "Account status update failed:",
        updateError?.message
      );

      return NextResponse.json(
        {
          message: "Unable to update customer account status.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Customer account status updated successfully.",
      userId: updated.id,
      status: newStatus,
    });
  } catch (error) {
    console.error("Admin status API error:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
        }
      
