import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";
import { z } from "zod";

const createTicketSchema = z.object({
  contactId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["bug", "feature_request", "pertanyaan", "keluhan_pelanggan", "internal"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

const TICKET_SELECT = `
  id,
  title,
  description,
  category,
  priority,
  status,
  image_url,
  created_at,
  assignee:profiles!tickets_assignee_id_fkey(full_name)
`;

/**
 * GET /api/extension/tickets?contact_id=xxx
 * Get tickets for a contact
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contact_id");

    if (!contactId) {
      return NextResponse.json(
        { error: "contact_id is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Get tickets for contact
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(TICKET_SELECT)
      .eq("contact_id", contactId)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Extension Tickets] Failed to fetch tickets:", error);
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      );
    }

    // Format response
    const formattedTickets = tickets.map((ticket: any) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.created_at,
      assigneeName: ticket.assignee?.full_name || null,
      imageUrl: ticket.image_url || null,
    }));

    return NextResponse.json({ data: formattedTickets });
  } catch (error) {
    console.error("[Extension Tickets] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/extension/tickets
 * Create a new ticket
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    let contactId: string;
    let title: string;
    let description: string;
    let category: string;
    let priority: string;
    let imageFile: File | null = null;

    // Check if request is FormData or JSON
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (with image)
      const formData = await request.formData();
      contactId = formData.get("contactId") as string;
      title = formData.get("title") as string;
      description = formData.get("description") as string;
      category = formData.get("category") as string;
      priority = formData.get("priority") as string;
      imageFile = formData.get("image") as File;
      
      // Validate required fields
      if (!contactId || !title || !description || !category || !priority) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON (without image)
      const body = await request.json();
      const validated = createTicketSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { error: "Invalid request body", details: validated.error.issues },
          { status: 400 }
        );
      }

      contactId = validated.data.contactId;
      title = validated.data.title;
      description = validated.data.description;
      category = validated.data.category;
      priority = validated.data.priority;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Upload image if exists
    let imageUrl: string | null = null;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop() || "png";
      const randomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const fileName = `${randomId}.${fileExt}`;
      const filePath = `ticket-attachments/${orgId}/${fileName}`;

      // Convert File to Buffer for upload
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      
      const { error: uploadError } = await supabase.storage
        .from("crm-media")
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("[Extension Tickets] Failed to upload image:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("crm-media")
        .getPublicUrl(filePath);
      
      imageUrl = urlData.publicUrl;
    }

    // Create ticket
    const ticketData: any = {
      org_id: orgId,
      reporter_id: user.id,
      contact_id: contactId,
      title,
      description,
      category,
      priority,
      status: "open",
    };

    if (imageUrl) {
      ticketData.image_url = imageUrl;
    }

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert(ticketData)
      .select(TICKET_SELECT)
      .single();

    if (error) {
      console.error("[Extension Tickets] Failed to create ticket:", error);
      return NextResponse.json(
        { error: "Failed to create ticket" },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "contact",
      entity_id: contactId,
      action: "note_added",
      details: { ticket_id: ticket.id, title },
      actor_id: user.id,
    });

    return NextResponse.json({
      data: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.created_at,
        assigneeName: (ticket.assignee as { full_name?: string }[] | null)?.[0]?.full_name || null,
        imageUrl: ticket.image_url || null,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("[Extension Tickets] API error:", error);
    console.error("[Extension Tickets] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
