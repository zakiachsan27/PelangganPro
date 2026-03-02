import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/debug/ticket - Test ticket access
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("id");
    const orgId = searchParams.get("org_id");
    
    if (!ticketId || !orgId) {
      return NextResponse.json({ error: "Missing ticket_id or org_id" }, { status: 400 });
    }
    
    console.log(`[Debug] Testing ticket access: ${ticketId} for org: ${orgId}`);
    
    const supabase = await createSupabaseServiceClient();
    
    // Test 1: Direct query with service role
    console.log("[Debug] Test 1: Direct query");
    const { data: ticket1, error: error1 } = await supabase
      .from("tickets")
      .select("id, title, org_id, contact_id")
      .eq("id", ticketId)
      .single();
    
    console.log("[Debug] Direct query result:", { ticket1, error: error1?.message });
    
    // Test 2: Query with org_id filter
    console.log("[Debug] Test 2: Query with org_id filter");
    const { data: ticket2, error: error2 } = await supabase
      .from("tickets")
      .select("id, title, org_id, contact_id, status")
      .eq("id", ticketId)
      .eq("org_id", orgId)
      .single();
    
    console.log("[Debug] Filtered query result:", { ticket2, error: error2?.message });
    
    // Test 3: Check if ticket exists at all
    console.log("[Debug] Test 3: Check all tickets");
    const { data: allTickets, error: error3 } = await supabase
      .from("tickets")
      .select("id, title, org_id")
      .limit(5);
    
    console.log("[Debug] All tickets:", { count: allTickets?.length, tickets: allTickets?.map((t: any) => ({ id: t.id, title: t.title, org_id: t.org_id })) });
    
    // Test 4: Check if org_id matches
    const { data: orgTickets, error: error4 } = await supabase
      .from("tickets")
      .select("id, title")
      .eq("org_id", orgId)
      .limit(5);
    
    console.log("[Debug] Org tickets:", { count: orgTickets?.length, error: error4?.message });
    
    return NextResponse.json({
      ticketId,
      orgId,
      test1: { success: !!ticket1, data: ticket1, error: error1?.message },
      test2: { success: !!ticket2, data: ticket2, error: error2?.message },
      allTicketsCount: allTickets?.length || 0,
      orgTicketsCount: orgTickets?.length || 0,
    });
    
  } catch (error: any) {
    console.error("[Debug] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
