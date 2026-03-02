import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { processMessage, getConversationHistory } from "@/lib/agent/agent-service-new";

export const dynamic = "force-dynamic";

// POST /api/agent/chat - Process message
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { message, session_id } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Generate session_id if not provided
    const sessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Process message using new Agent Loop
    const response = await processMessage({
      message,
      sessionId,
      userId: user.id,
      orgId: profile.org_id,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/agent/chat - Get conversation history
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const history = await getConversationHistory(session_id, user.id);

    return NextResponse.json({ data: history });
  } catch (error: any) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
