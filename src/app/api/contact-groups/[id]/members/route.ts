import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MEMBER_SELECT = `
  *,
  contact:contacts(id, first_name, last_name, phone, whatsapp, email)
`;

// GET /api/contact-groups/[id]/members — List members
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: group } = await supabase
    .from("contact_groups")
    .select("id")
    .eq("id", id)
    .single();
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("contact_group_members")
    .select(MEMBER_SELECT)
    .eq("group_id", id)
    .order("added_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/contact-groups/[id]/members — Add members
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: group } = await supabase
    .from("contact_groups")
    .select("id")
    .eq("id", id)
    .single();
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const body = await req.json();

  if (!body.contact_ids || !Array.isArray(body.contact_ids) || body.contact_ids.length === 0) {
    return NextResponse.json({ error: "contact_ids array is required" }, { status: 400 });
  }

  const members = body.contact_ids.map((contactId: string) => ({
    group_id: id,
    contact_id: contactId,
    added_by: user.id,
  }));

  const { data, error } = await supabase
    .from("contact_group_members")
    .upsert(members, { onConflict: "group_id,contact_id" })
    .select(MEMBER_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, added: data?.length || 0 }, { status: 201 });
}

// DELETE /api/contact-groups/[id]/members — Remove members
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: group } = await supabase
    .from("contact_groups")
    .select("id")
    .eq("id", id)
    .single();
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const body = await req.json();

  if (!body.contact_ids || !Array.isArray(body.contact_ids) || body.contact_ids.length === 0) {
    return NextResponse.json({ error: "contact_ids array is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("contact_group_members")
    .delete()
    .eq("group_id", id)
    .in("contact_id", body.contact_ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ removed: body.contact_ids.length });
}
