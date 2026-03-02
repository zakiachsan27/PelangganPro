import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST /api/scheduler/[id]/start — Start scheduler
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("message_schedulers")
    .select("*, target_group:contact_groups(id, name)")
    .eq("id", id)
    .single();
  
  if (!existing) return NextResponse.json({ error: "Scheduler not found" }, { status: 404 });

  // Can only start if status is pending or paused
  if (!['pending', 'paused'].includes(existing.status)) {
    return NextResponse.json({ error: "Scheduler can only be started from pending or paused status" }, { status: 400 });
  }

  const body = await req.json();
  const wahaSession = body.waha_session;

  if (!wahaSession) {
    return NextResponse.json({ error: "waha_session is required" }, { status: 400 });
  }

  // Get contacts to send to
  let contacts: { id: string; phone: string }[] = [];
  
  if (existing.target_type === 'contacts') {
    // Get phone numbers from contact IDs
    const { data: contactData } = await supabase
      .from("contacts")
      .select("id, phone, whatsapp")
      .in("id", existing.target_contacts);
    
    contacts = (contactData || []).map((c: any) => ({
      id: c.id,
      phone: c.whatsapp || c.phone,
    })).filter((c: any) => c.phone);
  } else if (existing.target_type === 'group' && existing.target_group_id) {
    // Get contacts from group
    const { data: members } = await supabase
      .from("contact_group_members")
      .select("contact:contacts(id, phone, whatsapp)")
      .eq("group_id", existing.target_group_id);
    
    contacts = (members || []).map((m: any) => ({
      id: m.contact.id,
      phone: m.contact.whatsapp || m.contact.phone,
    })).filter((c: any) => c.phone);
  }

  if (contacts.length === 0) {
    return NextResponse.json({ error: "No valid contacts found to send messages" }, { status: 400 });
  }

  // Update scheduler status
  const { error: updateError } = await supabase
    .from("message_schedulers")
    .update({
      status: 'sending',
      waha_session: wahaSession,
      total_count: contacts.length,
      started_at: existing.status === 'pending' ? new Date().toISOString() : existing.started_at,
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Create pending logs for all contacts
  const logs = contacts.map((contact) => ({
    scheduler_id: id,
    contact_id: contact.id,
    phone: contact.phone,
    message: existing.message,
    status: 'pending',
  }));

  const { error: logsError } = await supabase
    .from("message_scheduler_logs")
    .insert(logs);

  if (logsError) {
    console.error("Failed to create logs:", logsError);
    // Continue even if logs creation fails
  }

  return NextResponse.json({
    message: "Scheduler started",
    total_contacts: contacts.length,
  });
}
