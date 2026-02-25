import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  // Run all queries in parallel
  const [
    contactsTotal,
    contactsNewThisMonth,
    openDeals,
    wonThisMonth,
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

    // Open deals count + sum of value
    supabase
      .from("deals")
      .select("value")
      .eq("org_id", orgId)
      .eq("status", "open"),

    // Won deals this month count + sum of value
    supabase
      .from("deals")
      .select("value")
      .eq("org_id", orgId)
      .eq("status", "won")
      .gte("actual_close_date", firstDayOfMonth),

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

  // Calculate open deals aggregates
  const openDealsData = openDeals.data || [];
  const openDealsCount = openDealsData.length;
  const openDealsValue = openDealsData.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );

  // Calculate won this month aggregates
  const wonData = wonThisMonth.data || [];
  const wonThisMonthCount = wonData.length;
  const wonThisMonthValue = wonData.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );

  return NextResponse.json({
    totalContacts: contactsTotal.count ?? 0,
    newContactsThisMonth: contactsNewThisMonth.count ?? 0,
    totalDeals: openDealsCount,
    openDealsValue: openDealsValue,
    wonThisMonth: wonThisMonthCount,
    wonValue: wonThisMonthValue,
    tasksDueToday: tasksDueToday.count ?? 0,
    overdueTasks: overdueTasks.count ?? 0,
  });
}
