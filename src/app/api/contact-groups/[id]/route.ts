import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GROUP_SELECT = `
  *,
  created_by_profile:profiles!contact_groups_created_by_fkey(id, full_name, avatar_url)
`;

// GET /api/contact-groups/[id] — Get single group
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("contact_groups")
    .select(GROUP_SELECT)
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// PATCH /api/contact-groups/[id] — Update group
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("contact_groups")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("contact_groups")
    .update(updates)
    .eq("id", id)
    .select(GROUP_SELECT)
    .single();

  if (error) {
    if (error.message.includes("unique constraint")) {
      return NextResponse.json({ error: "Group name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/contact-groups/[id] — Delete group
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("contact_groups")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const { error } = await supabase
    .from("contact_groups")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
