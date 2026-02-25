import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { createWahaSession, stopWahaSession, deleteWahaSession } from "@/lib/waha";

// POST /api/wa/sessions/[sessionId]/start — Start a fresh WAHA session (always re-creates)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("wa_sessions")
    .select("id, org_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Update DB status to connecting
  const serviceClient = await createSupabaseServiceClient();
  await serviceClient
    .from("wa_sessions")
    .update({ status: "connecting", qr_code_data: null })
    .eq("id", sessionId);

  try {
    // Always create a fresh WAHA session: stop → delete → create
    // This ensures a clean QR code scan every time
    await stopWahaSession().catch(() => {});
    await deleteWahaSession().catch(() => {});
    const res = await createWahaSession();

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      await serviceClient
        .from("wa_sessions")
        .update({ status: "disconnected" })
        .eq("id", sessionId);
      return NextResponse.json(
        { error: errData.message || "WAHA start failed" },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: true, ...data });
  } catch {
    // Revert status on connection failure
    await serviceClient
      .from("wa_sessions")
      .update({ status: "disconnected" })
      .eq("id", sessionId);

    return NextResponse.json(
      { error: "WAHA is not reachable" },
      { status: 503 }
    );
  }
}
