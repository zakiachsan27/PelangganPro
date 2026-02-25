import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEAL_SELECT = `
  *,
  contact:contacts(id, first_name, last_name),
  company:companies(id, name),
  owner:profiles!deals_owner_id_fkey(id, full_name, avatar_url),
  stage:pipeline_stages(id, name, color, is_won, is_lost)
`;

// GET /api/deals — List deals with filters
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const url = req.nextUrl;
  const pipeline_id = url.searchParams.get("pipeline_id");
  const stage_id = url.searchParams.get("stage_id");
  const status = url.searchParams.get("status");
  const contact_id = url.searchParams.get("contact_id");
  const company_id = url.searchParams.get("company_id");
  const owner_id = url.searchParams.get("owner_id");
  const search = url.searchParams.get("search");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("deals")
    .select(DEAL_SELECT, { count: "exact" })
    .eq("org_id", profile.org_id);

  if (pipeline_id) query = query.eq("pipeline_id", pipeline_id);
  if (stage_id) query = query.eq("stage_id", stage_id);
  if (status) query = query.eq("status", status);
  if (contact_id) query = query.eq("contact_id", contact_id);
  if (company_id) query = query.eq("company_id", company_id);
  if (owner_id) query = query.eq("owner_id", owner_id);
  if (search) query = query.ilike("title", `%${search}%`);

  query = query
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
  });
}

// POST /api/deals — Create a deal
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
  const { title, pipeline_id, stage_id } = body;

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!pipeline_id) return NextResponse.json({ error: "pipeline_id is required" }, { status: 400 });
  if (!stage_id) return NextResponse.json({ error: "stage_id is required" }, { status: 400 });

  const insertData: Record<string, unknown> = {
    org_id: profile.org_id,
    created_by: user.id,
    title,
    pipeline_id,
    stage_id,
  };

  // Optional fields
  if (body.contact_id !== undefined) insertData.contact_id = body.contact_id;
  if (body.company_id !== undefined) insertData.company_id = body.company_id;
  if (body.value !== undefined) insertData.value = body.value;
  if (body.currency !== undefined) insertData.currency = body.currency;
  if (body.owner_id !== undefined) insertData.owner_id = body.owner_id;
  if (body.status !== undefined) insertData.status = body.status;
  if (body.expected_close_date !== undefined) insertData.expected_close_date = body.expected_close_date;
  if (body.source !== undefined) insertData.source = body.source;
  if (body.position !== undefined) insertData.position = body.position;

  const { data, error } = await supabase
    .from("deals")
    .insert(insertData)
    .select(DEAL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
