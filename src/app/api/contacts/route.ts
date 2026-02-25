import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CONTACT_SELECT = `
  *,
  company:companies(id, name),
  owner:profiles!contacts_owner_id_fkey(id, full_name, avatar_url),
  tags:contact_tags(tag:tags(id, name, color))
`;

// GET /api/contacts — List contacts with filters, search, pagination
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const company_id = searchParams.get("company_id");
  const owner_id = searchParams.get("owner_id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contacts")
    .select(CONTACT_SELECT, { count: "exact" });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,whatsapp.ilike.%${search}%`
    );
  }

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);
  if (company_id) query = query.eq("company_id", company_id);
  if (owner_id) query = query.eq("owner_id", owner_id);

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

// POST /api/contacts — Create a new contact
export async function POST(req: NextRequest) {
  try {
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

    if (!body.first_name) {
      return NextResponse.json({ error: "first_name is required" }, { status: 400 });
    }

    // Build insert object with only defined values
    const insertData: any = {
      org_id: profile.org_id,
      created_by: user.id,
      first_name: body.first_name,
      status: body.status || 'lead',
      source: body.source || 'manual',
    };

    // Only add optional fields if they exist
    if (body.last_name) insertData.last_name = body.last_name;
    if (body.email) insertData.email = body.email;
    if (body.phone) insertData.phone = body.phone;
    if (body.whatsapp) insertData.whatsapp = body.whatsapp;
    if (body.position) insertData.position = body.position;
    if (body.company_id) insertData.company_id = body.company_id;
    if (body.owner_id) insertData.owner_id = body.owner_id;
    if (body.custom_fields) insertData.custom_fields = body.custom_fields;
    if (body.avatar_url) insertData.avatar_url = body.avatar_url;

    console.log("[Contacts API] Creating contact:", insertData);

    const { data, error } = await supabase
      .from("contacts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[Contacts API] Insert error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[Contacts API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err }, { status: 500 });
  }
}
