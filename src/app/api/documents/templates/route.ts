import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/documents/templates — List templates
// Returns: default templates (visible to all) + org-specific templates
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const includeInactive = searchParams.get("include_inactive") === "true";

  // Get user's org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  
  const userOrgId = profile?.org_id;

  // Build query to get:
  // 1. Default templates (is_default = true) - visible to all users
  // 2. Organization-specific templates (org_id = user's org) - only for that org
  let query = supabase
    .from("document_templates")
    .select("*")
    .or(`is_default.eq.true${userOrgId ? `,org_id.eq.${userOrgId}` : ''}`);

  if (type) query = query.eq("type", type);
  if (!includeInactive) query = query.eq("is_active", true);

  // Order: default first, then by created_at
  query = query.order("is_default", { ascending: false }).order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data || [] });
}

// POST /api/documents/templates — Create template
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

  if (!body.name || !body.type || !body.html_template || !body.css_styles || !body.form_schema) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      org_id: profile.org_id,
      name: body.name,
      type: body.type,
      description: body.description || null,
      ref_file_url: body.ref_file_url || null,
      ref_file_name: body.ref_file_name || null,
      html_template: body.html_template,
      css_styles: body.css_styles,
      form_schema: body.form_schema,
      is_default: body.is_default || false,
      is_active: body.is_active !== false,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
