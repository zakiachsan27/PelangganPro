import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SCHEDULER_SELECT = `
  *,
  target_group:contact_groups(id, name, contact_count),
  created_by_profile:profiles!message_schedulers_created_by_fkey(id, full_name, avatar_url)
`;

// GET /api/scheduler — List schedulers
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("message_schedulers")
    .select(SCHEDULER_SELECT, { count: "exact" });

  if (status) query = query.eq("status", status);

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count,
    page,
    limit,
  });
}

// POST /api/scheduler — Create a new scheduler
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();

  // Validation
  if (!body.name || !body.message) {
    return NextResponse.json({ error: "name and message are required" }, { status: 400 });
  }

  if (!body.target_type || !['contacts', 'group'].includes(body.target_type)) {
    return NextResponse.json({ error: "target_type must be 'contacts' or 'group'" }, { status: 400 });
  }

  if (body.target_type === 'contacts' && (!body.target_contacts || body.target_contacts.length === 0)) {
    return NextResponse.json({ error: "target_contacts is required when target_type is 'contacts'" }, { status: 400 });
  }

  if (body.target_type === 'group' && !body.target_group_id) {
    return NextResponse.json({ error: "target_group_id is required when target_type is 'group'" }, { status: 400 });
  }

  const interval = body.interval_seconds || 45;
  if (interval < 45) {
    return NextResponse.json({ error: "interval_seconds must be at least 45" }, { status: 400 });
  }

  // Calculate total count
  let totalCount = 0;
  if (body.target_type === 'contacts') {
    totalCount = body.target_contacts.length;
  } else {
    // Get contact count from group
    const { data: group } = await supabase
      .from("contact_groups")
      .select("contact_count")
      .eq("id", body.target_group_id)
      .single();
    totalCount = group?.contact_count || 0;
  }

  // Calculate random interval range
  // If interval is 60, min will be 45 (75% of 60), max will be 60
  const minInterval = Math.floor(interval * 0.75);
  const maxInterval = interval;

  const { data, error } = await supabase
    .from("message_schedulers")
    .insert({
      org_id: profile.org_id,
      name: body.name,
      message: body.message,
      target_type: body.target_type,
      target_contacts: body.target_type === 'contacts' ? body.target_contacts : [],
      target_group_id: body.target_type === 'group' ? body.target_group_id : null,
      interval_seconds: interval,
      min_interval: minInterval,
      max_interval: maxInterval,
      total_count: totalCount,
      created_by: user.id,
    })
    .select(SCHEDULER_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
