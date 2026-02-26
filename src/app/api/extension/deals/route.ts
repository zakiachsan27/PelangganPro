import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { verifyExtensionToken, getUserOrg } from "@/lib/extension-auth";

/**
 * GET /api/extension/deals
 * Get pipelines with stages for the org
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyExtensionToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 403 }
      );
    }

    // Get all stages for org first (debug)
    const { data: allStages, error: allStagesError } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("org_id", orgId)
      .limit(10);
    
    console.log("[Deals API] All stages in org:", allStages, "Error:", allStagesError);

    // Get pipelines with stages
    const { data: pipelines, error: pipelineError } = await supabase
      .from("pipelines")
      .select("id, name")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });

    if (pipelineError) {
      console.error("[Deals API] Failed to fetch pipelines:", pipelineError);
      return NextResponse.json(
        { error: "Failed to fetch pipelines" },
        { status: 500 }
      );
    }

    console.log("[Deals API] Found pipelines:", pipelines);

    // Get stages for each pipeline
    const pipelinesWithStages = await Promise.all(
      (pipelines || []).map(async (pipeline) => {
        console.log("[Deals API] Fetching stages for pipeline:", pipeline.id);
        
        // Try without org_id filter first
        const { data: stages, error: stagesError } = await supabase
          .from("pipeline_stages")
          .select("id, name, position")
          .eq("pipeline_id", pipeline.id)
          .order("position", { ascending: true });

        if (stagesError) {
          console.error("[Deals API] Failed to fetch stages:", stagesError);
        }
        console.log("[Deals API] Stages for pipeline", pipeline.id, ":", stages);

        return {
          ...pipeline,
          stages: stages || [],
        };
      })
    );
    
    console.log("[Deals API] Response:", pipelinesWithStages);

    return NextResponse.json({ data: pipelinesWithStages }, { status: 200 });
  } catch (error) {
    console.error("Extension get deals API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/extension/deals
 * Create a new deal for a contact
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
    const { contactId, title, value, currency, pipelineId, stageId } = body;

    if (!contactId || !title || !pipelineId || !stageId) {
      return NextResponse.json(
        { error: "Contact ID, title, pipeline and stage are required" },
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
      .select("id, org_id")
      .eq("id", contactId)
      .eq("org_id", orgId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify pipeline belongs to org
    const { data: pipeline, error: pipelineError } = await supabase
      .from("pipelines")
      .select("id")
      .eq("id", pipelineId)
      .eq("org_id", orgId)
      .single();

    if (pipelineError || !pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Verify stage belongs to pipeline
    const { data: stage, error: stageError } = await supabase
      .from("pipeline_stages")
      .select("id")
      .eq("id", stageId)
      .eq("pipeline_id", pipelineId)
      .single();

    if (stageError || !stage) {
      return NextResponse.json(
        { error: "Stage not found" },
        { status: 404 }
      );
    }

    // Create deal
    const dealData = {
      org_id: orgId,
      pipeline_id: pipelineId,
      contact_id: contactId,
      title: title,
      value: value || 0,
      currency: currency || "IDR",
      stage_id: stageId,
      status: "open",
      created_by: user.id,
    };
    
    console.log("[Deals API] Creating deal with data:", dealData);
    
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .insert(dealData)
      .select()
      .single();

    if (dealError) {
      console.error("[Deals API] Failed to create deal:", dealError);
      return NextResponse.json(
        { error: "Failed to create deal", details: dealError.message },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      entity_type: "deal",
      entity_id: deal.id,
      action: "created",
      details: { title, value, currency },
      actor_id: user.id,
    });

    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error) {
    console.error("Extension create deal API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
