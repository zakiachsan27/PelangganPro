import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats — Get aggregate dashboard statistics
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
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Get pipelines for this org first
  const { data: pipelines } = await supabase
    .from("pipelines")
    .select("id")
    .eq("org_id", orgId);

  const pipelineIds = (pipelines || []).map(p => p.id);
  console.log('[Dashboard Stats] Pipeline IDs:', pipelineIds);

  // Get all stages for these pipelines
  let stages: any[] = [];
  if (pipelineIds.length > 0) {
    const { data: stagesData, error: stagesError } = await supabase
      .from("pipeline_stages")
      .select("id, is_won, is_lost, name, pipeline_id")
      .in("pipeline_id", pipelineIds);

    if (stagesError) {
      console.error('[Dashboard Stats] Error fetching stages:', stagesError);
    } else {
      stages = stagesData || [];
    }
  }

  console.log('[Dashboard Stats] Org ID:', orgId);
  console.log('[Dashboard Stats] Stages count:', stages.length);

  const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
  const lostStageIds = stages.filter(s => s.is_lost).map(s => s.id);
  const closedStageIds = [...wonStageIds, ...lostStageIds];

  console.log('[Dashboard Stats] Won stage IDs:', wonStageIds);
  console.log('[Dashboard Stats] Lost stage IDs:', lostStageIds);
  console.log('[Dashboard Stats] Closed stage IDs:', closedStageIds);
  
  // Log all stages with their won/lost status
  console.log('[Dashboard Stats] All stages:');
  stages.forEach(s => {
    console.log(`  - ${s.name}: id=${s.id.substring(0,8)}..., is_won=${s.is_won}, is_lost=${s.is_lost}`);
  });

  // Run all queries in parallel (except stages which we already fetched)
  const [
    contactsTotal,
    contactsNewThisMonth,
    allDeals,
    tasksDueToday,
    overdueTasks,
  ] = await Promise.all([
    // Total contacts count
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),

    // New contacts this month
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", firstDayOfMonth),

    // All deals with stage_id
    supabase
      .from("deals")
      .select("id, value, stage_id, actual_close_date, title")
      .eq("org_id", orgId),

    // Tasks due today (not done or cancelled)
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("due_date", today)
      .not("status", "in", "(done,cancelled)"),

    // Overdue tasks (due_date < today, not done or cancelled)
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .lt("due_date", today)
      .not("status", "in", "(done,cancelled)"),
  ]);

  // Filter deals based on stage
  const allDealsData = allDeals.data || [];
  
  console.log('[Dashboard Stats] All deals count:', allDealsData.length);
  
  // Create stage lookup map
  const stageMap = new Map(stages.map(s => [s.id, s]));
  
  // Log each deal's stage name
  allDealsData.forEach(d => {
    const stage = stageMap.get(d.stage_id);
    console.log(`[Dashboard Stats] Deal ${d.id.substring(0,8)}... stage_name=${stage?.name || 'UNKNOWN'}, is_won=${stage?.is_won}, is_lost=${stage?.is_lost}`);
  });

  // Open deals: deals with stages that are NOT won and NOT lost
  const openDealsData = allDealsData.filter(d => {
    const stage = stageMap.get(d.stage_id);
    const isClosed = stage?.is_won || stage?.is_lost || false;
    console.log(`[Dashboard Stats] Deal ${d.id.substring(0,8)}... open check: stage=${stage?.name}, isClosed=${isClosed}`);
    return !isClosed;
  });
  
  // Won deals this month: deals with won stage 
  const wonThisMonthData = allDealsData.filter(d => {
    const stage = stageMap.get(d.stage_id);
    const isWon = stage?.is_won || false;
    console.log(`[Dashboard Stats] Deal ${d.id.substring(0,8)}... won check: stage=${stage?.name}, isWon=${isWon}`);
    if (!isWon) return false;
    if (d.actual_close_date) {
      return d.actual_close_date >= firstDayOfMonth.split('T')[0];
    }
    return true;
  });

  console.log('[Dashboard Stats] Open deals count:', openDealsData.length, 'total value:', openDealsData.reduce((s, d) => s + (Number(d.value) || 0), 0));
  console.log('[Dashboard Stats] Won this month count:', wonThisMonthData.length, 'total value:', wonThisMonthData.reduce((s, d) => s + (Number(d.value) || 0), 0));

  // Calculate open deals aggregates
  const openDealsCount = openDealsData.length;
  const openDealsValue = openDealsData.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );

  // Calculate won this month aggregates
  const wonThisMonthCount = wonThisMonthData.length;
  const wonThisMonthValue = wonThisMonthData.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );

  const response = NextResponse.json({
    totalContacts: contactsTotal.count ?? 0,
    newContactsThisMonth: contactsNewThisMonth.count ?? 0,
    totalDeals: openDealsCount,
    openDealsValue: openDealsValue,
    wonThisMonth: wonThisMonthCount,
    wonValue: wonThisMonthValue,
    tasksDueToday: tasksDueToday.count ?? 0,
    overdueTasks: overdueTasks.count ?? 0,
  });
  
  // Disable caching
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
