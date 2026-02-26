import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";
import { z } from "zod";

const updateContactSchema = z.object({
  status: z.enum(["lead", "active", "customer", "inactive"]).optional(),
  source: z.enum(["whatsapp", "instagram", "web", "referral", "tokopedia", "shopee", "import", "manual"]).optional(),
});

/**
 * PATCH /api/extension/contacts/[id]
 * Update contact status or source
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify token from Authorization header
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updateContactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.issues },
        { status: 400 }
      );
    }

    // Create service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's org_id
    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 403 }
      );
    }

    // Verify contact belongs to org
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Update contact
    const { error: updateError } = await supabase
      .from("contacts")
      .update({
        ...validated.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", orgId);

    if (updateError) {
      console.error("Failed to update contact:", updateError);
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "contact",
      entity_id: id,
      action: "updated",
      details: validated.data,
      actor_id: user.id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Extension update contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
