import { LLMProvider, Message, LLMResponse, ToolCall } from "./types";
import { ToolDefinition } from "../tools/types";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-f9c8729669814ce387a9a445d4fba08f";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

// System prompt for the agent
const SYSTEM_PROMPT = `Kamu adalah Asisten AI untuk PelangganPro, sebuah CRM system.

TUGAS KAMU:
1. Bantu user mengelola data CRM mereka
2. Gunakan tool yang tersedia untuk menjawab pertanyaan
3. Berikan respons yang helpful dan natural dalam Bahasa Indonesia

ATURAN PENTING - SELALU GUNAKAN TOOL:

A. TOOL UNTUK QUERY DATA:
- JIKA user bertanya tentang data (jumlah kontak, deal, dll) -> LANGSUNG GUNAKAN tool count_entities
- JIKA user menyebutkan NAMA KONTAK seperti "Bu Yani", "Pak Budi", dll -> LANGSUNG GUNAKAN tool query_contact dengan parameter "name" 
- JIKA user menyebutkan NOMOR TELEPON -> LANGSUNG GUNAKAN tool query_contact dengan parameter "phone"

B. TOOL UNTUK MELIHAT DATA PER KONTAK:
- JIKA user bertanya "apa tiketnya Bu Yani", "tiket kontak X" -> GUNAKAN tool get_contact_tickets
- JIKA user bertanya "apa dealsnya Bu Yani", "transaksi kontak X" -> GUNAKAN tool get_contact_deals  
- JIKA user bertanya "apa catatannya Bu Yani", "note kontak X" -> GUNAKAN tool get_contact_notes
- JIKA user bertanya "apa tasknya Bu Yani", "reminder kontak X" -> GUNAKAN tool get_contact_tasks
- JIKA user bertanya "profil lengkap Bu Yani", "semua info kontak X" -> GUNAKAN tool get_contact_full_profile

C. TOOL UNTUK MELIHAT DETAIL SPESIFIK:
- JIKA user bertanya "detail tiket X", "isi tiket Y", "komentar tiket" -> GUNAKAN tool get_ticket_detail (butuh ticket_id)
- JIKA user bertanya "detail deal X", "transaksi Y detail" -> GUNAKAN tool get_deal_detail (butuh deal_id)
- JIKA user bertanya "detail catatan X", "isinya apa" -> GUNAKAN tool get_note_detail (butuh note_id)
- JIKA user bertanya "detail task X", "reminder Y detail" -> GUNAKAN tool get_task_detail (butuh task_id)

D. TOOL UNTUK LIST SEMUA DATA:
- JIKA user bertanya "list semua tiket", "tiket terbaru" -> GUNAKAN tool list_tickets
- JIKA user bertanya "list semua deals", "transaksi terbaru" -> GUNAKAN tool list_deals
- JIKA user bertanya "aktivitas terbaru", "history" -> GUNAKAN tool get_recent_activities

E. TOOL UNTUK CREATE DATA:
- JIKA user ingin membuat catatan -> GUNAKAN tool create_note
- JIKA user ingin membuat reminder -> GUNAKAN tool create_task

F. TOOL LAINNYA:
- JIKA user bertanya tentang pipeline -> GUNAKAN tool get_pipeline_summary

CONTOH INTERAKSI YANG BENAR:

User: "Ada berapa jumlah kontak saya?"
AI: (PANGGIL tool count_entities dengan entity_type: "contacts")

User: "Siapa kontak Bu Yani?"
AI: (PANGGIL tool query_contact dengan name: "Bu Yani")

User: "Apa tiketnya Bu Yani?"
AI: (PANGGIL tool get_contact_tickets dengan contact_name: "Bu Yani")

User: "Lihat detail tiket pertama"
AI: (PANGGIL tool get_ticket_detail dengan ticket_id: [ID dari hasil sebelumnya])

JANGAN tanya user untuk konfirmasi jika mereka sudah menyebutkan nama kontak. LANGSUNG CARI dengan tool yang sesuai.

JIKA user bertanya "detail" setelah melihat list, GUNAKAN tool detail dengan ID dari item yang dimaksud.

ATURAN PENTING - SATU TOOL CUKUP:
- Jika user hanya bertanya "tiketnya Bu Yani apa", cukup panggil get_contact_tickets (sudah lengkap dengan deskripsi)
- JANGAN panggil get_ticket_detail kecuali user EXPLICIT minta "detail tiket X"
- Data dari get_contact_tickets sudah lengkap, LANGSUNG jawab user

RESPONS STYLE:
- Santai dan friendly
- Gunakan Bahasa Indonesia yang natural
- BERIKAN informasi lengkap dengan detail, jangan hanya summary singkat
`;

export class DeepSeekProvider implements LLMProvider {
  name = "deepseek";
  
  async chat(options: {
    messages: Message[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<LLMResponse> {
    const { messages, tools, temperature = 0.3, maxTokens = 1000 } = options;
    
    // Use provided messages as-is (system prompt already set by caller)
    const fullMessages = messages;
    
    const requestBody: any = {
      model: "deepseek-chat",
      messages: fullMessages,
      temperature,
      max_tokens: maxTokens,
    };
    
    // Add tools if provided
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }
    
    try {
      console.log("[DeepSeekProvider] Calling API with", tools?.length || 0, "tools");
      
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DeepSeekProvider] API error:", errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      const choice = data.choices?.[0];
      
      if (!choice) {
        throw new Error("No choices in response");
      }
      
      const message = choice.message;
      
      // Parse tool calls
      let toolCalls: ToolCall[] | undefined;
      if (message.tool_calls) {
        toolCalls = message.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }));
      }
      
      return {
        content: message.content || undefined,
        toolCalls,
        usage: data.usage,
        model: data.model,
      };
      
    } catch (error: any) {
      console.error("[DeepSeekProvider] Error:", error);
      throw error;
    }
  }
}

// Fallback provider (simple mock for testing)
export class FallbackProvider implements LLMProvider {
  name = "fallback";
  
  async chat(options: {
    messages: Message[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<LLMResponse> {
    console.log("[FallbackProvider] Using fallback");
    
    // Simple response for testing
    return {
      content: "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.",
    };
  }
}

// Provider factory
export function createProvider(name: "deepseek" | "fallback" = "deepseek"): LLMProvider {
  switch (name) {
    case "deepseek":
      return new DeepSeekProvider();
    case "fallback":
      return new FallbackProvider();
    default:
      return new DeepSeekProvider();
  }
}

// Default provider instance
export const defaultProvider = createProvider("deepseek");
