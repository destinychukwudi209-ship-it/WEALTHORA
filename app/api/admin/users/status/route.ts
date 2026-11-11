
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/admin";

const allowedStatuses = [
  "active",
  "suspended",
  "frozen",
  "closed",
] as const;

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Please sign in again.", status: 401 };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    error ||
    !profile ||
    !["admin", "super_admin"].includes(profile.role)
  ) {
    return {
      error: "You are not authorized to manage accounts.",
      status: 403,
    };
  }

  return { user };
}

export async function GET() {
  try {
    const auth = await verifyAdmin();

    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    const admin = await createAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, role, status, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Customer records error:", error);
      return NextResponse.json(
        { message: "Unable to load customer records." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      customers: data || [],
    });
  } catch (error) {
    console.error("Customer GET API error:", error);
    return NextResponse.json(
      { message: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();

    if ("error" in auth) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const targetUserId =
      typeof body.userId === "string" ? body.userId.trim() : "";

    const newStatus =
      typeof body.status === "string" ? body.status : "";

    if (
      !targetUserId ||
      targetUserId === auth.user.id ||
      !allowedStatuses.includes(
        newStatus as (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        { message: "Invalid customer account or status." },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    const { data: updated, error } = await admin
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", targetUserId)
      .eq("role", "customer")
      .select("id, role, status")
      .maybeSingle();

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json(
        { message: `Database error ${error.code}: ${error.message}` },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { message: "Customer profile was not found." },
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
      { message: "Unexpected server error." },
      { status: 500 }
    );
  }
      }
