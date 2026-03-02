import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DOCUMENT_SELECT = `
  *,
  template:document_templates(id, name, type)
`;

// GET /api/documents — List documents
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("template_id");
  const status = searchParams.get("status");

  let query = supabase
    .from("generated_documents")
    .select(DOCUMENT_SELECT);

  if (templateId) query = query.eq("template_id", templateId);
  if (status) query = query.eq("status", status);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/documents — Create document
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
    .from("generated_documents")
    .insert({
      org_id: profile.org_id,
      template_id: body.template_id || null,
      title: body.title,
      data: body.data || {},
      status: body.status || "draft",
      contact_id: body.contact_id || null,
      created_by: user.id,
    })
    .select(DOCUMENT_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
