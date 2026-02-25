import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[Stage API] Request body:", body);

    const { contactId, stageId } = body;

    if (!contactId || !stageId) {
      return NextResponse.json(
        { error: "contactId and stageId required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "No org" }, { status: 403 });
    }

    // Find deal for this contact
    const { data: deal } = await supabase
      .from("deals")
      .select("id")
      .eq("contact_id", contactId)
      .eq("org_id", orgId)
      .eq("status", "open")
      .single();

    if (!deal) {
      return NextResponse.json({ error: "No active deal found" }, { status: 404 });
    }

    // Update stage
    const { error: updateError } = await supabase
      .from("deals")
      .update({ stage_id: stageId })
      .eq("id", deal.id);

    if (updateError) {
      console.error("[Stage API] Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Stage API] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
