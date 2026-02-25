import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TASK_SELECT = `
  *,
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url),
  contact:contacts(id, first_name, last_name),
  deal:deals(id, title)
`;

// GET /api/tasks — List tasks with filters and pagination
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignee_id = searchParams.get("assignee_id");
  const contact_id = searchParams.get("contact_id");
  const deal_id = searchParams.get("deal_id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("tasks")
    .select(TASK_SELECT, { count: "exact" });

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (assignee_id) query = query.eq("assignee_id", assignee_id);
  if (contact_id) query = query.eq("contact_id", contact_id);
  if (deal_id) query = query.eq("deal_id", deal_id);

  query = query
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count,
    page,
    limit,
  });
}

// POST /api/tasks — Create a new task
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

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: profile.org_id,
      created_by: user.id,
      title: body.title,
      description: body.description,
      due_date: body.due_date,
      priority: body.priority,
      status: body.status,
      assignee_id: body.assignee_id,
      contact_id: body.contact_id,
      deal_id: body.deal_id,
    })
    .select(TASK_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
