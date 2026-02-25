import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNoteSchema = z.object({
  contactId: z.string().uuid(),
  content: z.string().min(1),
});

/**
 * POST /api/extension/note
 * Add a note to a contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createNoteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.errors },
        { status: 400 }
      );
    }

    const { contactId, content } = validated.data;

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

    // Get user's org_id and verify contact belongs to org
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

    // Verify contact exists in org
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("org_id", profile.org_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Create note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        org_id: profile.org_id,
        contact_id: contactId,
        content,
        author_id: user.id,
      })
      .select()
      .single();

    if (noteError) {
      console.error("Failed to create note:", noteError);
      return NextResponse.json(
        { error: "Failed to create note" },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: profile.org_id,
      entity_type: "contact",
      entity_id: contactId,
      action: "note_added",
      details: { note_id: note.id },
      actor_id: user.id,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("Extension note API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
