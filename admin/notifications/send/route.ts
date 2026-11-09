import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedTypes = [
  "announcement",
  "deposit",
  "withdrawal",
  "investment",
  "security",
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    const type =
      typeof body.type === "string" ? body.type : "";

    const audience =
      typeof body.audience === "string" ? body.audience : "";

    if (!title || title.length > 100) {
      return NextResponse.json(
        { error: "Enter a valid notification title." },
        { status: 400 }
      );
    }

    if (!message || message.length > 2000) {
      return NextResponse.json(
        { error: "Enter a valid notification message." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification category." },
        { status: 400 }
      );
    }

    if (audience !== "all") {
      return NextResponse.json(
        { error: "Unsupported notification audience." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc(
      "send_admin_notification",
      {
        p_title: title,
        p_message: message,
        p_type: type,
      }
    );

    if (error) {
      console.error("Notification sending failed:", error.message);

      return NextResponse.json(
        { error: "Could not send notification. Check admin permissions." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      recipientCount: data,
      message: "Notification sent successfully.",
    });
  } catch (error) {
    console.error("Notification API error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
      }
