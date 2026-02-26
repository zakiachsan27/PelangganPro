import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/debug/notes
 * Debug endpoint to check notes with and without RLS
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const supabaseClient = await createSupabaseServerClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's org_id
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const contact_id = searchParams.get("contact_id");

    // Service role client - bypass RLS
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all notes for this contact (bypass RLS)
    const { data: allNotes, error: allError } = await serviceSupabase
      .from("notes")
      .select("*, author:profiles(full_name)")
      .eq("contact_id", contact_id);

    // Get notes via RLS (current user session)
    const { data: rlsNotes, error: rlsError } = await supabaseClient
      .from("notes")
      .select("*, author:profiles(full_name)")
      .eq("contact_id", contact_id);

    // Get contact details
    const { data: contact } = await serviceSupabase
      .from("contacts")
      .select("id, org_id, first_name, last_name")
      .eq("id", contact_id)
      .single();

    return NextResponse.json({
      debug: {
        current_user_id: user.id,
        current_user_org_id: profile?.org_id,
        contact_id: contact_id,
        contact_org_id: contact?.org_id,
      },
      all_notes: {
        count: allNotes?.length || 0,
        data: allNotes || [],
        error: allError?.message,
      },
      rls_notes: {
        count: rlsNotes?.length || 0,
        data: rlsNotes || [],
        error: rlsError?.message,
      },
      org_match: profile?.org_id === contact?.org_id ? "YES" : "NO - MISMATCH!",
    });
  } catch (error) {
    console.error("[Debug Notes] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
