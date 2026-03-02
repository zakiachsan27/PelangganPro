import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SCHEDULER_SELECT = `
  *,
  target_group:contact_groups(id, name, contact_count),
  created_by_profile:profiles!message_schedulers_created_by_fkey(id, full_name, avatar_url)
`;

// GET /api/scheduler/[id] — Get single scheduler
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("message_schedulers")
    .select(SCHEDULER_SELECT)
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json({ error: "Scheduler not found" }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// PATCH /api/scheduler/[id] — Update scheduler
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("message_schedulers")
    .select("id, status")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Scheduler not found" }, { status: 404 });

  // Cannot edit if already sending
  if (existing.status === 'sending') {
    return NextResponse.json({ error: "Cannot edit scheduler while sending" }, { status: 400 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.message !== undefined) updates.message = body.message;
  if (body.interval_seconds !== undefined) {
    if (body.interval_seconds < 45) {
      return NextResponse.json({ error: "interval_seconds must be at least 45" }, { status: 400 });
    }
    updates.interval_seconds = body.interval_seconds;
    updates.min_interval = Math.floor(body.interval_seconds * 0.75);
    updates.max_interval = body.interval_seconds;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("message_schedulers")
    .update(updates)
    .eq("id", id)
    .select(SCHEDULER_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/scheduler/[id] — Delete scheduler
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("message_schedulers")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Scheduler not found" }, { status: 404 });

  // Delete associated logs first
  await supabase.from("message_scheduler_logs").delete().eq("scheduler_id", id);

  const { error } = await supabase
    .from("message_schedulers")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
