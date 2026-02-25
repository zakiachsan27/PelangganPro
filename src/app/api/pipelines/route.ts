import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/pipelines — List pipelines with stages
export async function GET() {
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
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sort stages by position within each pipeline
  if (data) {
    for (const pipeline of data) {
      if (pipeline.stages) {
        pipeline.stages.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
      }
    }
  }

  return NextResponse.json(data);
}

// POST /api/pipelines — Create a pipeline
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
  const { name, is_default } = body;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const insertData: Record<string, unknown> = {
    org_id: profile.org_id,
    name,
  };
  if (is_default !== undefined) insertData.is_default = is_default;

  const { data, error } = await supabase
    .from("pipelines")
    .insert(insertData)
    .select("*, stages:pipeline_stages(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
