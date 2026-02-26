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

// POST /api/pipelines — Create a pipeline with default stages
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

  // Start a transaction by using the same supabase client
  const insertData: Record<string, unknown> = {
    org_id: profile.org_id,
    name,
  };
  if (is_default !== undefined) insertData.is_default = is_default;

  // Create pipeline
  const { data: pipeline, error: pipelineError } = await supabase
    .from("pipelines")
    .insert(insertData)
    .select()
    .single();

  if (pipelineError) return NextResponse.json({ error: pipelineError.message }, { status: 500 });

  // Create default stages for the pipeline
  const defaultStages = [
    { name: "New Lead", position: 1, color: "#3b82f6", is_won: false, is_lost: false },
    { name: "Contacted", position: 2, color: "#8b5cf6", is_won: false, is_lost: false },
    { name: "Interested", position: 3, color: "#f59e0b", is_won: false, is_lost: false },
    { name: "Quotation Sent", position: 4, color: "#10b981", is_won: false, is_lost: false },
    { name: "Deal Won", position: 5, color: "#22c55e", is_won: true, is_lost: false },
    { name: "Deal Lost", position: 6, color: "#ef4444", is_won: false, is_lost: true },
  ];

  const { error: stagesError } = await supabase
    .from("pipeline_stages")
    .insert(
      defaultStages.map((stage) => ({
        ...stage,
        pipeline_id: pipeline.id,
      }))
    );

  if (stagesError) {
    console.error("Failed to create default stages:", stagesError);
    // Don't fail the request, just log the error
  }

  // Fetch pipeline with stages
  const { data: pipelineWithStages, error: fetchError } = await supabase
    .from("pipelines")
    .select("*, stages:pipeline_stages(*)")
    .eq("id", pipeline.id)
    .single();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  // Sort stages by position
  if (pipelineWithStages?.stages) {
    pipelineWithStages.stages.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  }

  return NextResponse.json(pipelineWithStages, { status: 201 });
}
