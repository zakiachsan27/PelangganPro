import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/pipelines/[id] — Get a single pipeline with stages
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

  const { data, error } = await supabase
    .from("pipelines")
    .select("*, stages:pipeline_stages(*)")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  // Sort stages by position
  if (data.stages) {
    data.stages.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  }

  return NextResponse.json(data);
}

// PATCH /api/pipelines/[id] — Update a pipeline
export async function PATCH(
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

  // Verify pipeline exists and belongs to org
  const { data: existing } = await supabase
    .from("pipelines")
    .select("id")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();
  if (!existing) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.is_default !== undefined) updates.is_default = body.is_default;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pipelines")
    .update(updates)
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .select("*, stages:pipeline_stages(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sort stages by position
  if (data?.stages) {
    data.stages.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  }

  return NextResponse.json(data);
}

// DELETE /api/pipelines/[id] — Delete a pipeline
export async function DELETE(
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

  const { error } = await supabase
    .from("pipelines")
    .delete()
    .eq("id", id)
    .eq("org_id", profile.org_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
