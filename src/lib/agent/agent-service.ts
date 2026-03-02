import { processMessageWithLLM, Message, generateToolResponse, withTimeout } from "./llm-service";
import {
  createNote,
  createTask,
  queryContact,
  updateDeal,
  countEntities,
  analyzeData,
  listRecentActivities,
  ActionContext,
  ActionResult,
} from "./actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AgentResponse {
  reply: string;
  actions: Array<{
    id: string;
    type: string;
    status: "pending" | "success" | "failed";
    result?: ActionResult;
    requires_confirmation: boolean;
    confirmation_message?: string;
  }>;
  session_id: string;
  requires_confirmation: boolean;
}

export async function processAgentMessage(
  message: string,
  session_id: string,
  user_id: string,
  org_id: string,
  confirmed_action_id?: string
): Promise<AgentResponse> {
  const supabase = await createSupabaseServerClient();
  const context: ActionContext = { org_id, user_id };

  try {
    // 1. Get conversation history
    const { data: history } = await supabase
      .from("agent_conversations")
      .select("role, content")
      .eq("session_id", session_id)
      .eq("user_id", user_id)
      .order("created_at", { ascending: true })
      .limit(10);

    const messages: Message[] = [
      ...(history || []).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    // 2. Process with LLM
    const llmResponse = await processMessageWithLLM(messages, { org_id, user_id });

    // 3. Save user message
    await supabase.from("agent_conversations").insert({
      org_id,
      user_id,
      session_id,
      role: "user",
      content: message,
    });

    // 4. Handle confirmation
    if (confirmed_action_id) {
      const { data: action } = await supabase
        .from("agent_actions")
        .select("*")
        .eq("id", confirmed_action_id)
        .single();

      if (action && action.status === "pending") {
        // Execute the confirmed action
        const result = await executeAction(action.action_type, action.payload, context);
        
        // Update action status
        await supabase
          .from("agent_actions")
          .update({
            status: result.success ? "success" : "failed",
            error_message: result.error || null,
            executed_at: new Date().toISOString(),
            confirmed: true,
          })
          .eq("id", confirmed_action_id);

        // Save assistant response
        await supabase.from("agent_conversations").insert({
          org_id,
          user_id,
          session_id,
          role: "assistant",
          content: result.message,
          intent: action.action_type,
          entities: action.payload,
        });

        return {
          reply: result.message,
          actions: [{
            id: confirmed_action_id,
            type: action.action_type,
            status: result.success ? "success" : "failed",
            result,
            requires_confirmation: false,
          }],
          session_id,
          requires_confirmation: false,
        };
      }
    }

    // 5. Execute action (if not requiring confirmation or non-destructive)
    const actions: AgentResponse["actions"] = [];
    let finalReply = llmResponse.response;

    console.log("[Agent] Intent:", llmResponse.intent);
    console.log("[Agent] Entities:", llmResponse.entities);
    console.log("[Agent] Requires confirmation:", llmResponse.requires_confirmation);

    if (llmResponse.intent !== "UNKNOWN" && llmResponse.intent !== "GREETING" && llmResponse.intent !== "ERROR") {
      // Create action record
      const { data: actionRecord } = await supabase
        .from("agent_actions")
        .insert({
          org_id,
          user_id,
          session_id,
          action_type: llmResponse.intent,
          target_entity: llmResponse.entities.entity_type || llmResponse.entities.contact_name || llmResponse.entities.deal_name,
          payload: llmResponse.entities,
          status: "pending",
          requires_confirmation: llmResponse.requires_confirmation,
        })
        .select()
        .single();

      if (actionRecord) {
        actions.push({
          id: actionRecord.id,
          type: llmResponse.intent,
          status: "pending",
          requires_confirmation: llmResponse.requires_confirmation,
          confirmation_message: llmResponse.confirmation_message,
        });

        // If not requiring confirmation, execute immediately
        if (!llmResponse.requires_confirmation) {
          try {
            console.log("[Agent] Executing action:", llmResponse.intent);
            
            // Execute action with timeout (10 seconds)
            const result = await withTimeout(
              executeAction(llmResponse.intent, llmResponse.entities, context),
              10000,
              "Action execution timed out after 10 seconds"
            );
            
            console.log("[Agent] Action result:", result);
            
            await supabase
              .from("agent_actions")
              .update({
                status: result.success ? "success" : "failed",
                error_message: result.error || null,
                executed_at: new Date().toISOString(),
              })
              .eq("id", actionRecord.id);

            actions[0].status = result.success ? "success" : "failed";
            actions[0].result = result;
            
            // Generate natural response from tool result using LLM
            if (result.success) {
              console.log("[Agent] Generating natural response from tool result...");
              finalReply = await withTimeout(
                generateToolResponse(llmResponse.intent, result, message),
                5000,
                "Response generation timed out"
              );
              console.log("[Agent] Natural response generated:", finalReply.substring(0, 100) + "...");
            } else {
              finalReply = result.message || "Maaf, tidak dapat menyelesaikan perintah tersebut.";
            }
          } catch (actionError: any) {
            console.error("[Agent] Action execution error:", actionError);
            await supabase
              .from("agent_actions")
              .update({
                status: "failed",
                error_message: actionError.message || "Unknown error",
                executed_at: new Date().toISOString(),
              })
              .eq("id", actionRecord.id);

            actions[0].status = "failed";
            
            if (actionError.message?.includes("timed out")) {
              finalReply = "Maaf, proses terlalu lama. Silakan coba lagi atau periksa koneksi internet Anda.";
            } else {
              finalReply = "Maaf, terjadi kesalahan saat mengeksekusi perintah. Silakan coba lagi.";
            }
          }
        }
      }
    }

    // 6. Save assistant response
    await supabase.from("agent_conversations").insert({
      org_id,
      user_id,
      session_id,
      role: "assistant",
      content: finalReply,
      intent: llmResponse.intent,
      entities: llmResponse.entities,
      actions: actions.map((a) => a.id),
    });

    return {
      reply: finalReply,
      actions,
      session_id,
      requires_confirmation: llmResponse.requires_confirmation,
    };
  } catch (error: any) {
    console.error("Agent processing error:", error);
    
    // Save error response
    await supabase.from("agent_conversations").insert({
      org_id,
      user_id,
      session_id,
      role: "assistant",
      content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
      intent: "ERROR",
    });

    return {
      reply: "Maaf, terjadi kesalahan. Silakan coba lagi.",
      actions: [],
      session_id,
      requires_confirmation: false,
    };
  }
}

async function executeAction(
  intent: string,
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  switch (intent) {
    case "CREATE_NOTE":
      return createNote(entities, context);
    case "CREATE_TASK":
      return createTask(entities, context);
    case "QUERY_CONTACT":
      return queryContact(entities, context);
    case "UPDATE_DEAL":
      return updateDeal(entities, context);
    case "COUNT_ENTITIES":
      return countEntities(entities, context);
    case "ANALYZE_DATA":
      return analyzeData(entities, context);
    case "LIST_ACTIVITIES":
      return listRecentActivities(entities, context);
    default:
      return {
        success: false,
        message: `Action "${intent}" belum diimplementasikan.`,
      };
  }
}

export async function getConversationHistory(
  session_id: string,
  user_id: string,
  limit: number = 20
) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("agent_conversations")
    .select("role, content, created_at")
    .eq("session_id", session_id)
    .eq("user_id", user_id)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }

  return data || [];
}

export async function confirmAction(action_id: string, user_id: string) {
  const supabase = await createSupabaseServerClient();
  
  // Get action details
  const { data: action } = await supabase
    .from("agent_actions")
    .select("*")
    .eq("id", action_id)
    .eq("user_id", user_id)
    .single();

  if (!action) {
    return { success: false, error: "Action not found" };
  }

  if (action.status !== "pending") {
    return { success: false, error: "Action already processed" };
  }

  // Return action details for execution
  return { success: true, action };
}
