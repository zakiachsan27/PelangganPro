import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const contactId = request.nextUrl.searchParams.get("id");
    const phone = request.nextUrl.searchParams.get("phone");
    const name = request.nextUrl.searchParams.get("name"); // Optional: name from WhatsApp
    const autoCreate = request.nextUrl.searchParams.get("autoCreate") === "true";

    if (!contactId && !phone) {
      return NextResponse.json({ error: "ID or phone required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "No org" }, { status: 403 });
    }

    let contact = null;

    // If contactId provided, query by ID (more reliable)
    if (contactId) {
      console.log("[Extension API] Looking for contact by ID:", contactId);
      const { data: contactById, error: idError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .eq("org_id", orgId)
        .single();
      
      if (!idError && contactById) {
        contact = contactById;
      }
    }

    // Normalize phone early for reuse
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

    // Fallback to phone search if no ID or contact not found by ID
    if (!contact && cleanPhone) {
      console.log("[Extension API] Looking for phone:", phone);

      // Try ilike search
      const { data: contacts } = await supabase
        .from("contacts")
        .select("*")
        .eq("org_id", orgId)
        .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);

      contact = contacts?.[0];

      // If not found, try with stripped prefix
      if (!contact) {
        const stripped = cleanPhone.replace(/^(62|0)/, "");
        const { data: contacts2 } = await supabase
          .from("contacts")
          .select("*")
          .eq("org_id", orgId)
          .or(`phone.ilike.%${stripped}%,whatsapp.ilike.%${stripped}%`);
        contact = contacts2?.[0];
      }
    }

    // AUTO-CREATE: If contact not found and autoCreate=true
    if (!contact && autoCreate && cleanPhone) {
      console.log("[Extension API] Contact not found, auto-creating...");
      
      // Parse name from WhatsApp (if provided)
      let firstName = "New Lead";
      let lastName = null;
      
      if (name && name.trim()) {
        const nameParts = name.trim().split(" ");
        firstName = nameParts[0];
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(" ");
        }
      }

      // Determine whatsapp field
      const whatsappNum = cleanPhone.startsWith("62") ? cleanPhone : "62" + cleanPhone.replace(/^0/, "");
      const phoneNum = cleanPhone.startsWith("0") ? cleanPhone : "0" + cleanPhone.replace(/^62/, "");

      const { data: newContact, error: createError } = await supabase
        .from("contacts")
        .insert({
          org_id: orgId,
          created_by: user.id,
          first_name: firstName,
          last_name: lastName,
          phone: phoneNum,
          whatsapp: whatsappNum,
          status: "lead",
          source: "whatsapp",
        })
        .select()
        .single();

      if (createError) {
        console.error("[Extension API] Auto-create failed:", createError);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
      }

      console.log("[Extension API] Contact auto-created:", newContact.id);
      contact = newContact;
    }

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return await buildResponse(supabase, contact);

  } catch (error) {
    console.error("[Extension API] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function buildResponse(supabase: any, contact: any) {
  // Get tags
  const { data: contactTags } = await supabase
    .from("contact_tags")
    .select("tags(id, name, color)")
    .eq("contact_id", contact.id);

  // Get deals - include all statuses (open, won, lost)
  const { data: deals } = await supabase
    .from("deals")
    .select("*, pipeline_stages(name)")
    .eq("contact_id", contact.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get notes
  const { data: notes } = await supabase
    .from("notes")
    .select("*, author:profiles(full_name)")
    .eq("contact_id", contact.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get assigned user
  let assignedTo = null;
  if (contact.owner_id) {
    const { data: owner } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", contact.owner_id)
      .single();
    
    if (owner) {
      assignedTo = { id: owner.id, name: owner.full_name, avatarUrl: owner.avatar_url };
    }
  }

  // Get deal status for pipeline display
  const dealStatus = deals?.status as string | undefined;

  return NextResponse.json({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name || ""}`.trim(),
    phone: contact.phone || contact.whatsapp,
    email: contact.email,
    status: contact.status,
    source: contact.source,
    tags: contactTags?.map((t: any) => t.tags).filter(Boolean) || [],
    pipeline: deals ? {
      id: "default",
      name: "Sales Pipeline",
      stage: (deals.pipeline_stages as any)?.name || "Unknown",
      stageId: deals.stage_id,
      status: dealStatus,
    } : null,
    deal: deals ? {
      id: deals.id,
      title: deals.title,
      value: deals.value,
      currency: deals.currency,
      status: dealStatus,
    } : null,
    recentNotes: notes?.map((n: any) => ({
      id: n.id,
      content: n.content,
      createdAt: n.created_at,
      authorName: n.author?.full_name || "Unknown",
    })) || [],
    assignedTo,
  });
}
