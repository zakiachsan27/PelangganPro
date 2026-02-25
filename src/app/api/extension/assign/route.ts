import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[Assign API] Request body:", body);

    const { contactId, assigneeId } = body;

    if (!contactId || !assigneeId) {
      return NextResponse.json(
        { error: "contactId and assigneeId required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(contactId) || !uuidRegex.test(assigneeId)) {
      return NextResponse.json(
        { error: "Invalid UUID format" },
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

    // Update contact owner
    const { error: updateError } = await supabase
      .from("contacts")
      .update({ owner_id: assigneeId })
      .eq("id", contactId)
      .eq("org_id", orgId);

    if (updateError) {
      console.error("[Assign API] Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Assign API] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
