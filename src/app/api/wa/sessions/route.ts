import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { createWahaSession } from "@/lib/waha";

// GET /api/wa/sessions — List org's WA sessions
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: sessions, error } = await supabase
    .from("wa_sessions")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(sessions);
}

// POST /api/wa/sessions — Create a new session and start it on WAHA
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Only owner/admin can create sessions
  if (!["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const { label, provider = "waha" } = body;
  if (!label) return NextResponse.json({ error: "label is required" }, { status: 400 });

  // Create session row via service client (bypasses RLS)
  const serviceClient = await createSupabaseServiceClient();
  const { data: session, error } = await serviceClient
    .from("wa_sessions")
    .insert({
      org_id: profile.org_id,
      provider,
      label,
      status: "connecting",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Start session on WAHA
  try {
    await createWahaSession();
  } catch {
    // WAHA might not be running yet — session is created, can start later
  }

  return NextResponse.json(session, { status: 201 });
}
