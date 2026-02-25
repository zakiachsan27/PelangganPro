import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TICKET_SELECT = `
  *,
  assignee:profiles!tickets_assignee_id_fkey(id, full_name, avatar_url),
  reporter:profiles!tickets_reporter_id_fkey(id, full_name, avatar_url),
  contact:contacts(id, first_name, last_name)
`;

// GET /api/tickets/[id] — Get single ticket with relations
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// PATCH /api/tickets/[id] — Update ticket
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS ensures user can only see their org's tickets
  const { data: existing } = await supabase
    .from("tickets")
    .select("id, status")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = await req.json();
  const allowedFields = [
    "title",
    "description",
    "category",
    "priority",
    "status",
    "assignee_id",
    "contact_id",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  // Auto-set resolved_at / closed_at on status transitions
  if (body.status && body.status !== existing.status) {
    if (body.status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }
    if (body.status === "closed") {
      updates.closed_at = new Date().toISOString();
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", id)
    .select(TICKET_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/tickets/[id] — Delete ticket
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS ensures user can only see their org's tickets
  const { data: existing } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
