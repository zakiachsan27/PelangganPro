import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createAgent, AgentLoop, AgentMessage } from "./agent-loop";
// Import tools to register them
import "./tools";

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
 * Process message using LLM-powered Agent Loop
 * - Uses DeepSeek for intent detection
 * - Uses tools to query CRM data
 * - Full agent loop with tool execution
 */
export async function processMessage(
  options: ProcessMessageOptions
): Promise<ProcessMessageResult> {
  const { message, sessionId, userId, orgId, conversationHistory } = options;
  
  console.log(`[AgentService] Processing with LLM Agent: "${message}"`);
  
  const supabase = await createSupabaseServiceClient();
  
  try {
    // Create agent with DeepSeek + tools
    const agent = createAgent();
    
    // Convert conversation history to agent format
    const history: AgentMessage[] = (conversationHistory || []).map((msg: any) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));
    
    // Process message through agent loop
    const response = await agent.processMessage(
      message,
      { orgId, userId, sessionId },
      history
    );
    
    console.log(`[AgentService] Completed: ${response.iterations} iterations, completed: ${response.completed}`);
    
    // Save to database
    await supabase.from("agent_conversations").insert([
      { org_id: orgId, user_id: userId, session_id: sessionId, role: "user", content: message },
      { org_id: orgId, user_id: userId, session_id: sessionId, role: "assistant", content: response.content },
    ]);
    
    return { 
      reply: response.content, 
      toolResults: response.toolResults.map(tr => ({
        success: !tr.isError,
        forUser: tr.forUser || "",
        data: tr.data,
      })), 
      sessionId 
    };
    
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
