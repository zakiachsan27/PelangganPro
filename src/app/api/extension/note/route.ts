import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";
import { z } from "zod";

const createNoteSchema = z.object({
  contactId: z.string().uuid(),
  content: z.string().min(1),
});

const updateNoteSchema = z.object({
  noteId: z.string().uuid(),
  content: z.string().min(1),
});

/**
 * POST /api/extension/note
 * Add a note to a contact
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
    const validated = createNoteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { contactId, content } = validated.data;

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

    console.log("[Extension Note] User:", user.id, "Org:", orgId, "Contact:", contactId);

    // Verify contact belongs to org
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      console.log("[Extension Note] Contact not found:", contactError?.message);
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Create note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        org_id: orgId,
        contact_id: contactId,
        content,
        author_id: user.id,
      })
      .select()
      .single();

    if (noteError) {
      console.error("[Extension Note] Failed to create note:", noteError);
      return NextResponse.json(
        { error: "Failed to create note" },
        { status: 500 }
      );
    }

    console.log("[Extension Note] Created note:", note.id, "org_id:", orgId);

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "contact",
      entity_id: contactId,
      action: "note_added",
      details: { note_id: note.id },
      actor_id: user.id,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("[Extension Note] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/extension/note
 * Update an existing note
 */
export async function PATCH(request: NextRequest) {
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
    const validated = updateNoteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { noteId, content } = validated.data;

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

    console.log("[Extension Note] Update - User:", user.id, "Org:", orgId, "Note:", noteId);

    // Verify note belongs to org and user is the author (or skip author check for flexibility)
    const { data: existingNote, error: noteError } = await supabase
      .from("notes")
      .select("id, contact_id, author_id")
      .eq("id", noteId)
      .eq("org_id", orgId)
      .single();

    if (noteError || !existingNote) {
      console.log("[Extension Note] Note not found:", noteError?.message);
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Update note
    const { data: updatedNote, error: updateError } = await supabase
      .from("notes")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .eq("org_id", orgId)
      .select()
      .single();

    if (updateError) {
      console.error("[Extension Note] Failed to update note:", updateError);
      return NextResponse.json(
        { error: "Failed to update note" },
        { status: 500 }
      );
    }

    console.log("[Extension Note] Updated note:", noteId);

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "contact",
      entity_id: existingNote.contact_id,
      action: "note_updated",
      details: { note_id: noteId },
      actor_id: user.id,
    });

    return NextResponse.json({ success: true, note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error("[Extension Note] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
