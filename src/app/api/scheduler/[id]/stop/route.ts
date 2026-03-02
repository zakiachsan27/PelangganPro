import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST /api/scheduler/[id]/stop — Stop scheduler (mark as completed)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("message_schedulers")
    .select("id, status")
    .eq("id", id)
    .single();
  
  if (!existing) return NextResponse.json({ error: "Scheduler not found" }, { status: 404 });

  if (!['sending', 'paused'].includes(existing.status)) {
    return NextResponse.json({ error: "Can only stop a sending or paused scheduler" }, { status: 400 });
  }

  const { error } = await supabase
    .from("message_schedulers")
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Scheduler stopped and marked as completed" });
}
