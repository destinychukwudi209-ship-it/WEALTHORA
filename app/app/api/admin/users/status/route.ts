
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/admin";

const allowedStatuses = ["active", "suspended", "frozen", "closed"];

export async function POST(request: NextRequest) {
  try {
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

    let body: { userId?: unknown; status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const targetUserId =
      typeof body.userId === "string" ? body.userId : "";

    const newStatus =
      typeof body.status === "string" ? body.status : "";

    if (
      !targetUserId ||
      targetUserId === user.id ||
      !allowedStatuses.includes(newStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid customer account or status." },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetError || !target || target.role !== "customer") {
      return NextResponse.json(
        { message: "Customer account not found." },
        { status: 404 }
      );
    }

    const { data: updated, error: updateError } = await admin
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
        { message: "Unable to update customer account status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Customer account status updated successfully.",
    });
  } catch (error) {
    console.error("Admin status API error:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
          }
      
