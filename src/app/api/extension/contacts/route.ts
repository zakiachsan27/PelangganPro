import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";

/**
 * GET /api/extension/contacts
 * List contacts for extension (Bearer token auth)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify token from Authorization header
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));

    // Get contacts for this org
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, phone, whatsapp, email")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Extension Contacts] Error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formatted = contacts.map((c: any) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name || ""}`.trim(),
      phone: c.whatsapp || c.phone || null,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("[Extension Contacts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/extension/contacts
 * Create new contact from extension
 */
export async function POST(request: NextRequest) {
  try {
    // Verify token from Authorization header
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.first_name) {
      return NextResponse.json(
        { error: "first_name is required" },
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

    // Build insert data
    const insertData: any = {
      org_id: orgId,
      created_by: user.id,
      first_name: body.first_name,
      status: body.status || 'lead',
      source: body.source || 'whatsapp',
    };

    if (body.last_name) insertData.last_name = body.last_name;
    if (body.phone) insertData.phone = body.phone;
    if (body.whatsapp) insertData.whatsapp = body.whatsapp;
    if (body.email) insertData.email = body.email;
    if (body.position) insertData.position = body.position;

    console.log("[Extension Contacts] Creating:", insertData);

    const { data: contact, error } = await supabase
      .from("contacts")
      .insert(insertData)
      .select("id, first_name, last_name, phone, whatsapp")
      .single();

    if (error) {
      console.error("[Extension Contacts] Insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formatted = {
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name || ""}`.trim(),
      phone: contact.whatsapp || contact.phone || null,
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("[Extension Contacts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
