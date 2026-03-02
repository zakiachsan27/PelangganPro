import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { processSimpleMessage } from "./simple-agent";

export interface ProcessMessageOptions {
  message: string;
  sessionId: string;
  userId: string;
  orgId: string;
  conversationHistory?: any[];
}

export interface ProcessMessageResult {
  reply: string;
  toolResults: Array<{
    success: boolean;
    forUser: string;
    data?: any;
  }>;
  sessionId: string;
}

/**
 * Process message using SIMPLE agent
 * - No loops, no chains
 * - Direct tool matching
 * - 1 question = 1 tool = 1 answer
 */
export async function processMessage(
  options: ProcessMessageOptions
): Promise<ProcessMessageResult> {
  const { message, sessionId, userId, orgId } = options;
  
  console.log(`[AgentService] Processing: "${message}"`);
  
  const supabase = await createSupabaseServiceClient();
  
  try {
    // Process with simple agent (no LLM for tool selection)
    const reply = await processSimpleMessage(message, {
      orgId,
      userId,
      sessionId,
    });
    
    console.log(`[AgentService] Completed: Simple agent finished`);
    
    // Save to database
    await supabase.from("agent_conversations").insert([
      { org_id: orgId, user_id: userId, session_id: sessionId, role: "user", content: message },
      { org_id: orgId, user_id: userId, session_id: sessionId, role: "assistant", content: reply },
    ]);
    
    return { reply, toolResults: [], sessionId };
    
  } catch (error: any) {
    console.error("[AgentService] Error:", error);
    
    const errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi.";
    
    await supabase.from("agent_conversations").insert({
      org_id: orgId, user_id: userId, session_id: sessionId,
      role: "assistant", content: errorMessage,
    });
    
    return { reply: errorMessage, toolResults: [], sessionId };
  }
}

/**
 * Get conversation history from database
 */
export async function getConversationHistory(
  sessionId: string,
  userId: string,
  limit: number = 20
): Promise<Array<{ role: string; content: string; created_at?: string }>> {
  const supabase = await createSupabaseServiceClient();
  
  const { data, error } = await supabase
    .from("agent_conversations")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error("[AgentService] Error fetching history:", error);
    return [];
  }
  
  return data || [];
}
