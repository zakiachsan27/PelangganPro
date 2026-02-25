import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/insights/heatmap — Get 5x5 RFM heatmap matrix
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch recency and frequency scores for all contact_rfm rows
  const { data, error } = await supabase
    .from("contact_rfm")
    .select("recency_score, frequency_score");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build 5x5 matrix: matrix[r-1][f-1] = count
  const matrix: number[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => 0)
  );

  for (const row of data || []) {
    const r = Number(row.recency_score);
    const f = Number(row.frequency_score);

    // Validate scores are in range 1-5
    if (r >= 1 && r <= 5 && f >= 1 && f <= 5) {
      matrix[r - 1][f - 1] += 1;
    }
  }

  return NextResponse.json({ matrix });
}
