import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/contacts/[id]/groups — Get contact's groups
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("contact_group_members")
    .select("group_id, group:contact_groups(id, name, description)")
    .eq("contact_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/contacts/[id]/groups — Assign contact to groups
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const body = await req.json();
  const groupIds = body.group_ids;

  if (!groupIds || !Array.isArray(groupIds)) {
    return NextResponse.json({ error: "group_ids array is required" }, { status: 400 });
  }

  // Delete existing group assignments
  await supabase
    .from("contact_group_members")
    .delete()
    .eq("contact_id", id);

  // Insert new group assignments
  if (groupIds.length > 0) {
    const members = groupIds.map((groupId: string) => ({
      contact_id: id,
      group_id: groupId,
      added_by: user.id,
    }));

    const { error } = await supabase
      .from("contact_group_members")
      .insert(members);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Groups updated successfully" });
}
