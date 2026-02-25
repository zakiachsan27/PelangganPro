import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { stopWahaSession, deleteWahaSession } from "@/lib/waha";

// DELETE /api/wa/sessions/[sessionId] — Disconnect and remove session
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify session belongs to user's org
  const { data: session } = await supabase
    .from("wa_sessions")
    .select("id, org_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Stop and delete WAHA session
  try {
    await stopWahaSession();
    await deleteWahaSession();
  } catch {
    // WAHA might not be running — still update DB
  }

  // Update status in DB
  const serviceClient = await createSupabaseServiceClient();
  await serviceClient
    .from("wa_sessions")
    .update({
      status: "disconnected",
      connected_at: null,
      phone_number: null,
      qr_code_data: null,
    })
    .eq("id", sessionId);

  return NextResponse.json({ success: true });
}

// PATCH /api/wa/sessions/[sessionId] — Update session (label, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("wa_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const body = await req.json();
  const { label } = body;

  const serviceClient = await createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("wa_sessions")
    .update({ label })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
