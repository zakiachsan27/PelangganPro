import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const VALID_SEGMENTS = [
  "champions",
  "loyal",
  "potential",
  "new_customers",
  "at_risk",
  "hibernating",
  "lost",
] as const;

const CONTACT_RFM_SELECT = `
  *,
  contact:contacts(id, first_name, last_name, email, phone, status, company_id, avatar_url)
`;

// GET /api/segments/[key] — Get contacts in a specific RFM segment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate segment key
  if (!VALID_SEGMENTS.includes(key as typeof VALID_SEGMENTS[number])) {
    return NextResponse.json(
      { error: `Invalid segment. Must be one of: ${VALID_SEGMENTS.join(", ")}` },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("contact_rfm")
    .select(CONTACT_RFM_SELECT, { count: "exact" })
    .eq("segment", key)
    .order("total_spent", { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count,
    page,
    limit,
  });
}
