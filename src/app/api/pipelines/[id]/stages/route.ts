import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/pipelines/[id]/stages — List stages for a pipeline
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Verify pipeline belongs to org
  const { data: pipeline } = await supabase
    .from("pipelines")
    .select("id")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();
  if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("pipeline_id", id)
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/pipelines/[id]/stages — Create a stage in a pipeline
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Verify pipeline belongs to org
  const { data: pipeline } = await supabase
    .from("pipelines")
    .select("id")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();
  if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  const body = await req.json();
  const { name } = body;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const insertData: Record<string, unknown> = {
    pipeline_id: id,
    name,
  };

  if (body.position !== undefined) insertData.position = body.position;
  if (body.color !== undefined) insertData.color = body.color;
  if (body.is_won !== undefined) insertData.is_won = body.is_won;
  if (body.is_lost !== undefined) insertData.is_lost = body.is_lost;

  const { data, error } = await supabase
    .from("pipeline_stages")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
