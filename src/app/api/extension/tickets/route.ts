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

    const body = await request.json();
    const validated = createTicketSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { contactId, title, description, category, priority } = validated.data;

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

    // Create ticket
    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        org_id: orgId,
        reporter_id: user.id,
        contact_id: contactId,
        title,
        description,
        category,
        priority,
        status: "open",
      })
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
      }
    }, { status: 201 });
  } catch (error) {
    console.error("[Extension Tickets] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
