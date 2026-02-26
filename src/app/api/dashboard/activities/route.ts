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

  // Get recent activities
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      action,
      entity_type,
      details,
      created_at,
      actor:actor_id(full_name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(10);

  const formattedActivities = (activities || []).map(activity => {
    const actorName = (activity.actor as any)?.full_name || "Unknown";
    const actionText = getActionText(activity.action, activity.entity_type);
    const details = activity.details as any;
    
    return {
      id: activity.id,
      actor: actorName,
      action: actionText,
      target: details?.title || details?.name || activity.entity_type,
      time: activity.created_at,
    };
  });

  const response = NextResponse.json({ data: formattedActivities });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function getActionText(action: string, entityType: string): string {
  const actionMap: Record<string, string> = {
    created: "membuat",
    updated: "mengupdate",
    deleted: "menghapus",
    won: "menang",
    lost: "kalah",
    assigned: "assign",
    note_added: "menambah catatan",
    stage_changed: "ubah stage",
  };
  
  const entityMap: Record<string, string> = {
    contact: "kontak",
    deal: "deal",
    task: "tugas",
    note: "catatan",
    company: "perusahaan",
    ticket: "tiket",
  };
  
  return `${actionMap[action] || action} ${entityMap[entityType] || entityType}`;
}
