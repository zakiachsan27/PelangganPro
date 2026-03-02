import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOG_SELECT = `
  *,
  contact:contacts(id, first_name, last_name, phone, whatsapp)
`;

// GET /api/scheduler/[id]/logs — Get scheduler logs
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("message_scheduler_logs")
    .select(LOG_SELECT, { count: "exact" })
    .eq("scheduler_id", id);

  if (status) query = query.eq("status", status);

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count,
    page,
    limit,
  });
}

// POST /api/scheduler/[id]/logs — Retry failed logs
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const logIds = body.log_ids;

  if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
    return NextResponse.json({ error: "log_ids array is required" }, { status: 400 });
  }

  // Update failed logs to pending for retry
  const { data, error } = await supabase
    .from("message_scheduler_logs")
    .update({
      status: 'pending',
      retry_count: supabase.rpc('increment_retry_count'),
      error_message: null,
    })
    .eq("scheduler_id", id)
    .in("id", logIds)
    .eq("status", 'failed')
    .select(LOG_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    message: "Logs marked for retry",
    retried: data?.length || 0,
  });
}
