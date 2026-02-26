import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

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

  const orgId = profile.org_id;

  // Get all pipelines and their stages
  const { data: pipelines } = await supabase
    .from("pipelines")
    .select("id, name")
    .eq("org_id", orgId);

  const pipelineIds = (pipelines || []).map(p => p.id);
  
  if (pipelineIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Get all stages for these pipelines
  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("id, name, position, is_won, is_lost, pipeline_id")
    .in("pipeline_id", pipelineIds)
    .order("position", { ascending: true });

  // Get all open deals (not won, not lost)
  const stageIds = (stages || []).map(s => s.id);
  const openStageIds = (stages || []).filter(s => !s.is_won && !s.is_lost).map(s => s.id);

  const { data: deals } = await supabase
    .from("deals")
    .select("value, stage_id")
    .eq("org_id", orgId)
    .in("stage_id", openStageIds);

  // Aggregate by stage
  const stageData = (stages || [])
    .filter(s => !s.is_won && !s.is_lost)
    .map(stage => {
      const stageDeals = (deals || []).filter(d => d.stage_id === stage.id);
      return {
        stage: stage.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        color: getStageColor(stage.position),
      };
    })
    .sort((a, b) => stageIds.indexOf(stages?.find(s => s.name === a.stage)?.id || '') - stageIds.indexOf(stages?.find(s => s.name === b.stage)?.id || ''));

  const response = NextResponse.json({ data: stageData });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function getStageColor(position: number): string {
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#f97316", // orange
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#ec4899", // pink
  ];
  return colors[position % colors.length];
}
