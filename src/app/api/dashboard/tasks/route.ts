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
  const today = new Date().toISOString().split("T")[0];

  // Get upcoming tasks (due today or in the future, not done/cancelled)
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      due_date,
      priority,
      status,
      contact:contact_id(first_name, last_name)
    `)
    .eq("org_id", orgId)
    .gte("due_date", today)
    .not("status", "in", "(done,cancelled)")
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false })
    .limit(5);

  const formattedTasks = (tasks || []).map(task => {
    const contact = task.contact as any;
    const contactName = contact ? `${contact.first_name} ${contact.last_name || ""}`.trim() : null;
    
    return {
      id: task.id,
      title: task.title,
      dueDate: task.due_date,
      priority: task.priority,
      status: task.status,
      contactName,
    };
  });

  const response = NextResponse.json({ data: formattedTasks });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
