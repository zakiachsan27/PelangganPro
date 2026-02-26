import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CONTACT_SELECT = `
  *,
  company:companies(id, name),
  owner:profiles!contacts_owner_id_fkey(id, full_name, avatar_url),
  tags:contact_tags(tag:tags(id, name, color)),
  deals:deals(id, value, status, stage:pipeline_stages(name))
`;

// GET /api/contacts — List contacts with filters, search, pagination
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const company_id = searchParams.get("company_id");
  const owner_id = searchParams.get("owner_id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contacts")
    .select(CONTACT_SELECT, { count: "exact" });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,whatsapp.ilike.%${search}%`
    );
  }

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);
  if (company_id) query = query.eq("company_id", company_id);
  if (owner_id) query = query.eq("owner_id", owner_id);

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Debug: log deals for Pak Juli and Miss Bella
  const pakJuli = data?.find((c: any) => c.first_name === 'Pak' && c.last_name === 'Juli');
  if (pakJuli) {
    console.log('[Contacts API] Pak Juli deals:', JSON.stringify(pakJuli.deals, null, 2));
  }
  const missBella = data?.find((c: any) => c.first_name === 'Miss' && c.last_name === 'Bella');
  if (missBella) {
    console.log('[Contacts API] Miss Bella deals:', JSON.stringify(missBella.deals, null, 2));
  }

  // Calculate lifetime_value and pipeline status for each contact
  const contactsWithData = (data || []).map((contact: any) => {
    const deals = contact.deals || [];
    
    // Calculate lifetime_value from won deals
    const lifetime_value = deals
      .filter((d: any) => d.status === 'won')
      .reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
    
    // Get current pipeline stage (from open deal or last deal)
    const openDeal = deals.find((d: any) => d.status === 'open');
    const pipeline_status = openDeal?.stage?.name || (deals.length > 0 ? 'No Active Deal' : '-');
    
    return {
      ...contact,
      lifetime_value,
      pipeline_status,
    };
  });

  return NextResponse.json({
    data: contactsWithData,
    total: count,
    page,
    limit,
  });
}

// POST /api/contacts — Create a new contact
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await req.json();

    if (!body.first_name) {
      return NextResponse.json({ error: "first_name is required" }, { status: 400 });
    }

    // Build insert object with only defined values
    const insertData: any = {
      org_id: profile.org_id,
      created_by: user.id,
      first_name: body.first_name,
      status: body.status || 'lead',
      source: body.source || 'manual',
    };

    // Only add optional fields if they exist
    if (body.last_name) insertData.last_name = body.last_name;
    if (body.email) insertData.email = body.email;
    if (body.phone) insertData.phone = body.phone;
    if (body.whatsapp) insertData.whatsapp = body.whatsapp;
    if (body.position) insertData.position = body.position;
    if (body.company_id) insertData.company_id = body.company_id;
    if (body.owner_id) insertData.owner_id = body.owner_id;
    if (body.custom_fields) insertData.custom_fields = body.custom_fields;
    if (body.avatar_url) insertData.avatar_url = body.avatar_url;

    console.log("[Contacts API] Creating contact:", insertData);

    const { data, error } = await supabase
      .from("contacts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[Contacts API] Insert error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // Auto-create deal in first stage of default pipeline for all contacts
    try {
      // 1. Get default pipeline for this org
      const { data: defaultPipeline } = await supabase
        .from("pipelines")
        .select("id")
        .eq("org_id", profile.org_id)
        .eq("is_default", true)
        .single();

      if (defaultPipeline) {
        // 2. Get first stage of this pipeline
        const { data: firstStage } = await supabase
          .from("pipeline_stages")
          .select("id")
          .eq("pipeline_id", defaultPipeline.id)
          .order("position", { ascending: true })
          .limit(1)
          .single();

        if (firstStage) {
          // 3. Create deal with contact info as title
          const fullName = `${body.first_name} ${body.last_name || ""}`.trim();
          const dealTitle = `Deal: ${fullName}`;
          
          const { error: dealError } = await supabase
            .from("deals")
            .insert({
              org_id: profile.org_id,
              created_by: user.id,
              pipeline_id: defaultPipeline.id,
              stage_id: firstStage.id,
              contact_id: data.id,
              company_id: body.company_id || null,
              title: dealTitle,
              value: 0,
              currency: "IDR",
              status: "open",
              position: 0,
              source: body.source || "manual",
            });

          if (dealError) {
            console.error("[Contacts API] Auto-create deal error:", dealError);
          } else {
            console.log("[Contacts API] Auto-created deal for contact:", data.id);
          }
        }
      }
    } catch (dealErr) {
      // Don't fail contact creation if deal auto-creation fails
      console.error("[Contacts API] Error in auto-deal creation:", dealErr);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[Contacts API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err }, { status: 500 });
  }
}
