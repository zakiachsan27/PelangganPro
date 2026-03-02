/**
 * PicoClaw-inspired Agent for PelangganPro
 * 
 * Pattern dari PicoClaw:
 * 1. Tool Loop - iterasi sampai selesai
 * 2. Subagent spawning untuk task kompleks
 * 3. Strict data handling - tidak hallucinate
 */

import { DeepSeekProvider } from "./providers/deepseek";
import { getToolRegistry, ToolRegistry } from "./tools/registry";
import { ToolCall as ToolCallType } from "./tools/types";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface AgentConfig {
  maxIterations?: number;
  toolTimeoutMs?: number;
  temperature?: number;
}

interface AgentContext {
  orgId: string;
  userId: string;
  sessionId: string;
}

interface ToolResult {
  tool_call_id: string;
  content: string;
}

export class PicoClawAgent {
  private provider = new DeepSeekProvider();
  private registry: ToolRegistry;
  private config: Required<AgentConfig>;

  constructor(config: AgentConfig = {}) {
    this.config = {
      maxIterations: config.maxIterations || 5,
      toolTimeoutMs: config.toolTimeoutMs || 15000,
      temperature: config.temperature || 0.2, // Low temp untuk less hallucination
    };
    this.registry = getToolRegistry();
  }

  /**
   * Process message dengan PicoClaw pattern:
   * 1. Parse intent
   * 2. Execute tools if needed
   * 3. Return final answer
   */
  async processMessage(message: string, context: AgentContext): Promise<string> {
    const supabase = await createSupabaseServiceClient();
    
    // System prompt yang strict
    const systemPrompt = `Kamu adalah AI Agent CRM PelangganPro.

ATURAN KERAS (WAJIB DIPATUHI):
1. Jawab HANYA berdasarkan data dari tool
2. JANGAN tambahkan informasi yang tidak ada di data
3. JANGAN interpretasi atau asumsi
4. Tampilkan data persis seperti di database
5. Jika deskripsi ada 2 point, tampilkan 2 point, jangan ditambah jadi 3

FORMAT OUTPUT:
- Judul: [judul dari data]
- Status: [status dari data]
- Deskripsi: [deskripsi persis dari data, jangan diubah]

JANGAN HALLUCINATE. JANGAN TAMBAH DATA SENDIRI.`;

    const toolDefs = this.registry.getDefinitions();
    
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    let iterations = 0;
    
    while (iterations < this.config.maxIterations) {
      iterations++;
      
      // Call LLM
      const response = await this.provider.chat({
        messages,
        tools: toolDefs,
      });

      // Handle tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        messages.push({
          role: "assistant",
          content: response.content || "",
          tool_calls: response.toolCalls.map((tc: ToolCallType) => ({
            id: tc.id,
            type: "function",
            function: tc.function,
          })),
        });

        // Execute tools
        for (const toolCall of response.toolCalls) {
          const result = await this.executeTool(toolCall, context);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }
        
        continue; // Continue loop untuk process tool results
      }

      // Final response
      return response.content || "Maaf, saya tidak bisa memproses permintaan Anda.";
    }

    return "Maaf, proses terlalu kompleks. Silakan coba pertanyaan yang lebih spesifik.";
  }

  private async executeTool(toolCall: ToolCallType, context: AgentContext): Promise<string> {
    try {
      const result = await this.registry.execute(toolCall, {
        orgId: context.orgId,
        userId: context.userId,
        sessionId: context.sessionId,
      });
      
      // Return forLLM content (detailed data)
      return result.forLLM || result.forUser || "No data";
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }
}

// Factory function
export function createPicoClawAgent(config?: AgentConfig): PicoClawAgent {
  return new PicoClawAgent(config);
}
