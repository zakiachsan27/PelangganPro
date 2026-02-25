import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWahaQR } from "@/lib/waha";

// GET /api/wa/sessions/[sessionId]/qr — Get QR code for session
export async function GET(
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
    .select("id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const qr = await getWahaQR();
  if (!qr) {
    return NextResponse.json(
      { error: "QR code not available. Session may already be connected or not started." },
      { status: 404 }
    );
  }

  return NextResponse.json({ qr });
}
