import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALL_SEGMENTS = [
  "champions",
  "loyal",
  "potential",
  "new_customers",
  "at_risk",
  "hibernating",
  "lost",
] as const;

// GET /api/segments/stats — Get aggregate stats for all RFM segments
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all contact_rfm rows (segment + total_spent) and aggregate in JS
  const { data, error } = await supabase
    .from("contact_rfm")
    .select("segment, total_spent");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build aggregation map
  const statsMap: Record<string, { count: number; totalRevenue: number }> = {};
  for (const seg of ALL_SEGMENTS) {
    statsMap[seg] = { count: 0, totalRevenue: 0 };
  }

  for (const row of data || []) {
    const seg = row.segment as string;
    if (statsMap[seg]) {
      statsMap[seg].count += 1;
      statsMap[seg].totalRevenue += Number(row.total_spent) || 0;
    }
  }

  const result = ALL_SEGMENTS.map((seg) => ({
    segment: seg,
    count: statsMap[seg].count,
    totalRevenue: statsMap[seg].totalRevenue,
    avgLtv: statsMap[seg].count > 0
      ? statsMap[seg].totalRevenue / statsMap[seg].count
      : 0,
  }));

  return NextResponse.json(result);
}
