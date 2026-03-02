import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GROUP_SELECT = `
  *,
  created_by_profile:profiles!contact_groups_created_by_fkey(id, full_name, avatar_url)
`;

// GET /api/contact-groups — List contact groups
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contact_groups")
    .select(GROUP_SELECT, { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

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

// POST /api/contact-groups — Create a new contact group
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

  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contact_groups")
    .insert({
      org_id: profile.org_id,
      name: body.name,
      description: body.description || null,
      created_by: user.id,
    })
    .select(GROUP_SELECT)
    .single();

  if (error) {
    if (error.message.includes("unique constraint")) {
      return NextResponse.json({ error: "Group name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
