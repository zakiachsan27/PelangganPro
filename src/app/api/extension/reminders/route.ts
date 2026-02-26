import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";
import { z } from "zod";

const createReminderSchema = z.object({
  contactId: z.string().uuid(),
  title: z.string().min(1),
  dueDate: z.string().datetime(),
});

/**
 * GET /api/extension/reminder?contact_id=xxx&upcoming=true
 * Get upcoming reminders/tasks for a contact
 */
export async function GET(request: NextRequest) {
  try {
    // Verify token from Authorization header
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contact_id");
    const upcoming = searchParams.get("upcoming") === "true";

    if (!contactId) {
      return NextResponse.json(
        { error: "contact_id is required" },
        { status: 400 }
      );
    }

    // Create service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's org_id
    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 403 }
      );
    }

    // Verify contact belongs to org
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Build query for tasks
    let query = supabase
      .from("tasks")
      .select("id, title, due_date, priority, status")
      .eq("contact_id", contactId)
      .eq("org_id", orgId)
      .order("due_date", { ascending: true })
      .limit(10);

    // Filter for upcoming tasks only
    if (upcoming) {
      // Get all non-completed tasks, not just future ones
      // User might have overdue tasks they still need to see
      query = query
        .in("status", ["todo", "in_progress"]);
    }

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      console.error("Failed to fetch reminders:", tasksError);
      return NextResponse.json(
        { error: "Failed to fetch reminders" },
        { status: 500 }
      );
    }

    // Map to TaskInfo format
    const reminders = (tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.due_date,
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      status: task.status,
    }));

    return NextResponse.json({ data: reminders }, { status: 200 });
  } catch (error) {
    console.error("Extension reminder API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/extension/reminder
 * Create a task/reminder for a contact
 */
export async function POST(request: NextRequest) {
  try {
    // Verify token from Authorization header
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createReminderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { contactId, title, dueDate } = validated.data;

    // Create service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's org_id
    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 403 }
      );
    }

    // Verify contact belongs to org
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id, owner_id")
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        org_id: orgId,
        title,
        due_date: dueDate,
        contact_id: contactId,
        assignee_id: contact.owner_id || user.id, // Assign to contact owner or current user
        priority: "medium",
        status: "todo",
        created_by: user.id,
      })
      .select()
      .single();

    if (taskError) {
      console.error("Failed to create reminder:", taskError);
      return NextResponse.json(
        { error: "Failed to create reminder" },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "task",
      entity_id: task.id,
      action: "created",
      details: {
        title,
        due_date: dueDate,
        contact_id: contactId,
      },
      actor_id: user.id,
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error("Extension reminder API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
