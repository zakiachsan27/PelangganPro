import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOTE_SELECT = `
  *,
  author:profiles!notes_author_id_fkey(id, full_name, avatar_url),
  contact:contacts(id, first_name, last_name)
`;

// GET /api/notes — List notes
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const contact_id = searchParams.get("contact_id");
  const company_id = searchParams.get("company_id");
  const deal_id = searchParams.get("deal_id");
  const author_id = searchParams.get("author_id");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  console.log("[API Notes GET] User:", user.id, "contact_id:", contact_id, "author_id:", author_id);

  // Get user's org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  console.log("[API Notes GET] User org_id:", profile.org_id);

  let query = supabase
    .from("notes")
    .select(NOTE_SELECT)
    .eq("org_id", profile.org_id);

  if (contact_id) query = query.eq("contact_id", contact_id);
  if (company_id) query = query.eq("company_id", company_id);
  if (deal_id) query = query.eq("deal_id", deal_id);
  if (author_id) query = query.eq("author_id", author_id);
  
  // Date range filter
  if (date_from) {
    const fromDate = new Date(date_from);
    fromDate.setHours(0, 0, 0, 0);
    query = query.gte("created_at", fromDate.toISOString());
  }
  if (date_to) {
    const toDate = new Date(date_to);
    toDate.setHours(23, 59, 59, 999);
    query = query.lte("created_at", toDate.toISOString());
  }

  query = query.order("created_at", { ascending: false }).limit(limit);

  const { data, error } = await query;

  console.log("[API Notes GET] Query result:", { count: data?.length, error: error?.message });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/notes — Create a new note
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

  if (!body.content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  console.log("[API Notes POST] Creating note:", { org_id: profile.org_id, contact_id: body.contact_id });

  const { data, error } = await supabase
    .from("notes")
    .insert({
      org_id: profile.org_id,
      author_id: user.id,
      content: body.content,
      contact_id: body.contact_id,
      company_id: body.company_id,
      deal_id: body.deal_id,
    })
    .select(NOTE_SELECT)
    .single();

  if (error) {
    console.error("[API Notes POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[API Notes POST] Created note:", data?.id);
  return NextResponse.json(data, { status: 201 });
}
