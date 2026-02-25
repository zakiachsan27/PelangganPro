import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOTE_SELECT = `
  *,
  author:profiles!notes_author_id_fkey(id, full_name, avatar_url)
`;

// GET /api/notes — List notes (requires at least one of contact_id, company_id, deal_id)
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const contact_id = searchParams.get("contact_id");
  const company_id = searchParams.get("company_id");
  const deal_id = searchParams.get("deal_id");

  if (!contact_id && !company_id && !deal_id) {
    return NextResponse.json(
      { error: "At least one of contact_id, company_id, or deal_id is required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("notes")
    .select(NOTE_SELECT);

  if (contact_id) query = query.eq("contact_id", contact_id);
  if (company_id) query = query.eq("company_id", company_id);
  if (deal_id) query = query.eq("deal_id", deal_id);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
