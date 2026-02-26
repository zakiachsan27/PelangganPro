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
  
  // Get last 6 months
  const now = new Date();
  const months: { month: string; year: number; revenue: number }[] = [];
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ 
      month: bulan[d.getMonth()], 
      year: d.getFullYear(),
      revenue: 0 
    });
  }

  // Get won deals for last 6 months
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
  const { data: pipelines } = await supabase
    .from("pipelines")
    .select("id")
    .eq("org_id", orgId);

  const pipelineIds = (pipelines || []).map(p => p.id);
  
  if (pipelineIds.length > 0) {
    // Get won stages
    const { data: wonStages } = await supabase
      .from("pipeline_stages")
      .select("id")
      .in("pipeline_id", pipelineIds)
      .eq("is_won", true);

    const wonStageIds = (wonStages || []).map(s => s.id);

    if (wonStageIds.length > 0) {
      // Get won deals with actual_close_date in last 6 months
      const { data: wonDeals } = await supabase
        .from("deals")
        .select("value, actual_close_date")
        .eq("org_id", orgId)
        .in("stage_id", wonStageIds)
        .gte("actual_close_date", startDate.split('T')[0]);

      // Aggregate by month
      (wonDeals || []).forEach(deal => {
        if (deal.actual_close_date) {
          const dealDate = new Date(deal.actual_close_date);
          const monthIndex = months.findIndex(m => {
            const dealMonth = dealDate.getMonth();
            const dealYear = dealDate.getFullYear();
            return bulan[dealMonth] === m.month && dealYear === m.year;
          });
          if (monthIndex !== -1) {
            months[monthIndex].revenue += Number(deal.value) || 0;
          }
        }
      });
    }
  }

  const response = NextResponse.json({ data: months });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
