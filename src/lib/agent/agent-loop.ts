import { LLMProvider, Message, ToolCall } from "./providers";
import { ToolRegistry, getToolRegistry } from "./tools/registry";
import { ToolContext, ToolResult, successResult } from "./tools/types";

export interface AgentConfig {
  llmProvider: LLMProvider;
  toolRegistry?: ToolRegistry;
  maxIterations?: number;
  toolTimeoutMs?: number;
  maxHistoryLength?: number;
}

export interface AgentContext {
  orgId: string;
  userId: string;
  sessionId: string;
  supabase?: any;
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface AgentResponse {
  content: string;
  toolResults: ToolResult[];
  iterations: number;
  completed: boolean;
}

/**
 * Agent Loop - Core orchestrator for AI Agent
 * 
 * Flow:
 * 1. User Message → LLM Parse Intent (with available tools)
 * 2. If tool calls needed → Execute Tools (with timeout)
 * 3. LLM Generate Response from Tool Results
 * 4. Return final response to user
 */
export class AgentLoop {
  private llmProvider: LLMProvider;
  private toolRegistry: ToolRegistry;
  private maxIterations: number;
  private toolTimeoutMs: number;
  private maxHistoryLength: number;

  constructor(config: AgentConfig) {
    this.llmProvider = config.llmProvider;
    this.toolRegistry = config.toolRegistry || getToolRegistry();
    this.maxIterations = config.maxIterations || 5;
    this.toolTimeoutMs = config.toolTimeoutMs || 10000;
    this.maxHistoryLength = config.maxHistoryLength || 20;
  }

  /**
   * Process a user message through the complete agent loop
   */
  async processMessage(
    message: string,
    context: AgentContext,
    conversationHistory: AgentMessage[] = []
  ): Promise<AgentResponse> {
    console.log("[AgentLoop] Starting message processing...");
    
    // Build tool context
    const toolContext: ToolContext = {
      orgId: context.orgId,
      userId: context.userId,
      sessionId: context.sessionId,
    };

    // Get available tool definitions for LLM
    const toolDefinitions = this.toolRegistry.getDefinitions();
    console.log(`[AgentLoop] Available tools: ${this.toolRegistry.getToolNames().join(", ")}`);

    // Prepare messages for LLM with strict system instruction
    const systemPrompt = `Kamu adalah asisten AI CRM PelangganPro.

ATURAN KERAS:
1. Gunakan tool untuk mengambil data dari database
2. Setelah dapat data, TAMPILKAN APA ADANYA - jangan tambah, jangan kurangi
3. JANGAN membuat informasi yang tidak ada di data
4. JANGAN menginterpretasi atau menebak isi data
5. Jika deskripsi berisi list (1. 2. 3.), tampilkan persis seperti itu, jangan tambahin nomor 4, 5, dst
6. LANGSUNG jawab setelah tool berhasil, tidak perlu tool tambahan

CONTOH SALAH:
Data: "1. Belum QA 2. Perlu segera"
❌ Jawaban: "1. Belum QA 2. Perlu segera 3. Ada bug minor"

CONTOH BENAR:
Data: "1. Belum QA 2. Perlu segera"  
✅ Jawaban: "1. Belum QA 2. Perlu segera"

TAMPILKAN DATA PERSIS APA ADANYA.`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...this.convertHistoryToMessages(conversationHistory),
      { role: "user", content: message },
    ];

    const toolResults: ToolResult[] = [];
    let iterations = 0;
    let finalResponse = "";

    // Agent Loop - Process until no more tool calls needed or max iterations
    while (iterations < this.maxIterations) {
      iterations++;
      console.log(`[AgentLoop] Iteration ${iterations}/${this.maxIterations}`);

      try {
        // Call LLM to get intent/response (with tool definitions)
        const llmResponse = await this.llmProvider.chat({
          messages,
          tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
        });

        // Handle tool calls if present
        if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
          console.log(`[AgentLoop] LLM requested ${llmResponse.toolCalls.length} tool(s)`);
          
          // Execute tools with timeout
          const iterationResults = await this.executeToolCalls(
            llmResponse.toolCalls,
            toolContext
          );
          
          toolResults.push(...iterationResults);

          // Add assistant message with tool calls to conversation
          messages.push({
            role: "assistant",
            content: llmResponse.content || "",
            tool_calls: llmResponse.toolCalls.map(tc => ({
              id: tc.id,
              type: "function",
              function: tc.function,
            })),
          });

          // Add tool results to conversation
          for (let i = 0; i < llmResponse.toolCalls.length; i++) {
            const toolCall = llmResponse.toolCalls[i];
            const result = iterationResults[i];
            
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result.forLLM,
            });
          }

          // Continue loop - LLM will process tool results
          continue;
        }

        // No tool calls - this is the final response
        finalResponse = llmResponse.content || "Maaf, saya tidak mengerti permintaan Anda.";
        console.log("[AgentLoop] Final response generated");
        break;

      } catch (error: any) {
        console.error("[AgentLoop] Error in iteration:", error);
        finalResponse = "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.";
        break;
      }
    }

    // Check if we hit max iterations
    if (iterations >= this.maxIterations && !finalResponse) {
      finalResponse = "Maaf, proses terlalu kompleks. Silakan coba dengan permintaan yang lebih spesifik.";
    }

    return {
      content: finalResponse,
      toolResults,
      iterations,
      completed: iterations < this.maxIterations,
    };
  }

  /**
   * Execute tool calls with timeout handling
   */
  private async executeToolCalls(
    toolCalls: ToolCall[],
    context: ToolContext
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      try {
        console.log(`[AgentLoop] Executing tool: ${toolCall.function.name}`);
        
        // Execute with timeout
        const result = await Promise.race([
          this.toolRegistry.execute(toolCall, context),
          new Promise<ToolResult>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after ${this.toolTimeoutMs}ms`)), this.toolTimeoutMs)
          ),
        ]);

        results.push(result);
        
        // Show progress to user if available
        if (result.forUser) {
          console.log(`[AgentLoop] Tool progress: ${result.forUser}`);
        }

      } catch (error: any) {
        console.error(`[AgentLoop] Tool execution error:`, error);
        results.push({
          forLLM: `Error: ${error.message || "Unknown error"}`,
          forUser: "Maaf, terjadi kesalahan saat mengeksekusi perintah.",
          isError: true,
          data: { error: error.message },
        });
      }
    }

    return results;
  }

  /**
   * Convert agent message history to LLM message format
   */
  private convertHistoryToMessages(history: AgentMessage[]): Message[] {
    const messages: Message[] = [];
    
    // Take only the most recent messages to stay within context limit
    const recentHistory = history.slice(-this.maxHistoryLength);
    
    for (const msg of recentHistory) {
      if (msg.role === "system") {
        messages.push({ role: "system", content: msg.content });
      } else if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        // Handle assistant messages with or without tool calls
        const assistantMsg: Message = { role: "assistant", content: msg.content };
        
        if (msg.toolCalls) {
          assistantMsg.tool_calls = msg.toolCalls.map(tc => ({
            id: tc.id,
            type: "function",
            function: tc.function,
          }));
        }
        
        messages.push(assistantMsg);
      }
    }

    return messages;
  }

  /**
   * Simple greeting handler for when no tools are needed
   */
  async handleSimpleMessage(
    message: string,
    conversationHistory: AgentMessage[] = []
  ): Promise<string> {
    const messages: Message[] = [
      ...this.convertHistoryToMessages(conversationHistory),
      { role: "user", content: message },
    ];

    const response = await this.llmProvider.chat({ messages });
    return response.content || "Maaf, saya tidak bisa menjawab saat ini.";
  }
}

// Factory function to create agent with default configuration
export function createAgent(config?: Partial<AgentConfig>): AgentLoop {
  // Import DeepSeekProvider here to avoid circular dependencies
  const { DeepSeekProvider } = require("./providers/deepseek");
  
  return new AgentLoop({
    llmProvider: config?.llmProvider || new DeepSeekProvider(),
    toolRegistry: config?.toolRegistry || getToolRegistry(),
    maxIterations: config?.maxIterations || 5,
    toolTimeoutMs: config?.toolTimeoutMs || 10000,
    maxHistoryLength: config?.maxHistoryLength || 20,
  });
}
