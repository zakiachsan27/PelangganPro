import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/insights/trends — Get customer trend data (new vs churned) per month
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

  // Get last 6 months
  const months: { month: string; monthNum: number; year: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: monthNames[d.getMonth()],
      monthNum: d.getMonth(),
      year: d.getFullYear()
    });
  }

  // Fetch contacts created per month (new customers)
  const { data: newContacts, error: newError } = await supabase
    .from("contacts")
    .select("created_at")
    .eq("org_id", orgId)
    .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

  if (newError) {
    return NextResponse.json({ error: newError.message }, { status: 500 });
  }

  // Count new customers per month
  const newCounts: Record<string, number> = {};
  for (const m of months) {
    newCounts[m.month] = 0;
  }
  
  for (const contact of newContacts || []) {
    const date = new Date(contact.created_at);
    const monthKey = monthNames[date.getMonth()];
    if (newCounts[monthKey] !== undefined) {
      newCounts[monthKey]++;
    }
  }

  // Fetch churned customers (lost segment) per month
  const { data: churnedContacts, error: churnedError } = await supabase
    .from("contact_rfm")
    .select("calculated_at, segment, contact:contact_id(org_id)")
    .eq("segment", "lost")
    .gte("calculated_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

  // Count churned per month
  const churnedCounts: Record<string, number> = {};
  for (const m of months) {
    churnedCounts[m.month] = 0;
  }

  if (!churnedError && churnedContacts) {
    for (const row of churnedContacts) {
      const contactOrgId = (row.contact as any)?.org_id;
      if (contactOrgId !== orgId) continue;
      
      const date = new Date(row.calculated_at);
      const monthKey = monthNames[date.getMonth()];
      if (churnedCounts[monthKey] !== undefined) {
        churnedCounts[monthKey]++;
      }
    }
  }

  const result = months.map(m => ({
    month: m.month,
    new: newCounts[m.month] || 0,
    churned: churnedCounts[m.month] || 0,
  }));

  return NextResponse.json(result);
}
