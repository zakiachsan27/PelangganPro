import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/insights/overview — Get insight overview stats from contact_rfm
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get current user's org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const orgId = profile.org_id;

  // Fetch contact_rfm rows with contact org_id filter
  const { data, error } = await supabase
    .from("contact_rfm")
    .select("segment, total_spent, contact:contact_id(org_id)")
    .eq("contact.org_id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const totalCustomers = rows.length;
  const totalRevenue = rows.reduce(
    (sum, row) => sum + (Number(row.total_spent) || 0),
    0
  );
  const avgLtv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const churnSegments = ["lost", "hibernating"];
  const churnCount = rows.filter((row) =>
    churnSegments.includes(row.segment as string)
  ).length;
  const churnRate = totalCustomers > 0 ? (churnCount / totalCustomers) * 100 : 0;

  return NextResponse.json({
    totalCustomers,
    totalRevenue,
    avgLtv,
    churnRate,
  });
}
