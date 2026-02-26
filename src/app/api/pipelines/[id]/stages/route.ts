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

  return NextResponse.json({ data: data || [] });
}

// PUT /api/pipelines/[id]/stages — Update all stages (bulk update)
export async function PUT(
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
  const { stages } = body;

  if (!Array.isArray(stages)) {
    return NextResponse.json({ error: "stages must be an array" }, { status: 400 });
  }

  try {
    // Get existing stages
    const { data: existingStages } = await supabase
      .from("pipeline_stages")
      .select("id")
      .eq("pipeline_id", id);

    const existingIds = new Set(existingStages?.map((s) => s.id) || []);
    const receivedIds = new Set(stages.filter((s) => s.id && !s.id.startsWith("stage-new-")).map((s) => s.id));

    // Delete stages that are not in the received list
    const idsToDelete = Array.from(existingIds).filter((id) => !receivedIds.has(id));
    console.log("[API Stages] Deleting stages:", idsToDelete);
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("pipeline_stages")
        .delete()
        .in("id", idsToDelete);
      
      if (deleteError) {
        console.error("[API Stages] Delete error:", deleteError);
        throw deleteError;
      }
    }

    // Upsert stages
    const stagesToUpsert = stages.map((stage: {
      id: string;
      name: string;
      position: number;
      color: string;
      is_won?: boolean;
      is_lost?: boolean;
    }) => {
      const isNew = stage.id.startsWith("stage-new-");
      const data: Record<string, any> = {
        pipeline_id: id,
        name: stage.name,
        position: stage.position,
        color: stage.color,
        is_won: stage.is_won || false,
        is_lost: stage.is_lost || false,
      };
      
      // Only include id for existing stages
      if (!isNew) {
        data.id = stage.id;
      }
      
      return data;
    });

    const { data, error } = await supabase
      .from("pipeline_stages")
      .upsert(stagesToUpsert)
      .select();

    if (error) {
      console.error("[API Stages] Upsert error:", error);
      console.error("[API Stages] Stages data:", stagesToUpsert);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error updating stages:", error);
    return NextResponse.json({ error: error.message || "Failed to update stages" }, { status: 500 });
  }
}
