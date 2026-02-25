import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TICKET_SELECT = `
  *,
  assignee:profiles!tickets_assignee_id_fkey(id, full_name, avatar_url),
  reporter:profiles!tickets_reporter_id_fkey(id, full_name, avatar_url),
  contact:contacts(id, first_name, last_name)
`;

// GET /api/tickets — List tickets with filters, search, pagination
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");
  const assignee_id = searchParams.get("assignee_id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("tickets")
    .select(TICKET_SELECT, { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (category) query = query.eq("category", category);
  if (assignee_id) query = query.eq("assignee_id", assignee_id);

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

// POST /api/tickets — Create a new ticket
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
  if (!body.description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      org_id: profile.org_id,
      reporter_id: user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: body.status,
      assignee_id: body.assignee_id,
      contact_id: body.contact_id,
    })
    .select(TICKET_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
