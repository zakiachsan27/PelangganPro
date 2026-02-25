import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createReminderSchema = z.object({
  contactId: z.string().uuid(),
  title: z.string().min(1),
  dueDate: z.string().datetime(),
});

/**
 * POST /api/extension/reminder
 * Create a task/reminder for a contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createReminderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.errors },
        { status: 400 }
      );
    }

    const { contactId, title, dueDate } = validated.data;

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's org_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
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
      .eq("org_id", profile.org_id)
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
        org_id: profile.org_id,
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
      org_id: profile.org_id,
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
