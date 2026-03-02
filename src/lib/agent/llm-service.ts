// DeepSeek LLM Service for AI Agent
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-f9c8729669814ce387a9a445d4fba08f";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export interface LLMResponse {
  intent: string;
  entities: Record<string, any>;
  response: string;
  requires_confirmation: boolean;
  confirmation_message?: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Kamu adalah Asisten AI untuk PelangganPro, sebuah CRM (Customer Relationship Management) system.

TUGAS KAMU:
1. Parse instruksi user menjadi action yang dapat dieksekusi
2. Jawab pertanyaan berdasarkan data CRM yang tersedia
3. Berikan respons yang helpful dan natural dalam Bahasa Indonesia

ENTITY YANG TERSEDIA:
- Contacts: name, phone, email, status, source, whatsapp
- Companies: name, industry, address
- Deals: name, value, stage, status, expected_close_date
- Notes: content, created_at, contact_id
- Tasks: title, due_date, priority, status, contact_id
- Tickets: title, description, category, priority, status
- Activities: action logs

FORMAT RESPONSE (JSON):
{
  "intent": "ACTION_NAME",
  "entities": {
    "contact_name": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "content": "string or null",
    "deal_name": "string or null",
    "stage": "string or null",
    "value": "number or null",
    "title": "string or null",
    "due_date": "string or null",
    "priority": "low|medium|high|urgent or null",
    "category": "string or null",
    "query": "string or null"
  },
  "response": "string - pesan untuk user",
  "requires_confirmation": "boolean - true jika action destructive",
  "confirmation_message": "string or null - pesan konfirmasi jika destructive"
}

ACTIONS YANG TERSEDIA:
- CREATE_NOTE: Buat catatan untuk kontak
- CREATE_TASK: Buat reminder/task
- UPDATE_DEAL: Update deal (stage, value)
- QUERY_CONTACT: Cari informasi kontak
- QUERY_DEALS: Informasi deals
- COUNT_ENTITIES: Hitung jumlah (contacts, deals, tickets)
- ANALYZE_DATA: Analisis data (RFM, pipeline)
- LIST_ENTITIES: List data (top deals, recent activities)
- GREETING: Sapaan/small talk
- UNKNOWN: Jika tidak mengerti

CONTOH INTERAKSI:

User: "Buat catatan untuk kontak 628452318312, isinya meeting berjalan lancar"
Response: {
  "intent": "CREATE_NOTE",
  "entities": {
    "phone": "628452318312",
    "content": "meeting berjalan lancar"
  },
  "response": "Saya akan membuat catatan untuk kontak dengan nomor 628452318312",
  "requires_confirmation": false,
  "confirmation_message": null
}

User: "Siapa kontak nomor 628123456789?"
Response: {
  "intent": "QUERY_CONTACT",
  "entities": {
    "phone": "628123456789"
  },
  "response": "Mencari informasi kontak dengan nomor 628123456789...",
  "requires_confirmation": false
}

User: "Hapus deal Website Project"
Response: {
  "intent": "DELETE_DEAL",
  "entities": {
    "deal_name": "Website Project"
  },
  "response": "Anda yakin ingin menghapus deal 'Website Project'? Tindakan ini tidak dapat dibatalkan.",
  "requires_confirmation": true,
  "confirmation_message": "Hapus deal Website Project?"
}

User: "Berapa deals yang aktif?"
Response: {
  "intent": "COUNT_ENTITIES",
  "entities": {
    "entity_type": "deals",
    "filter": "active"
  },
  "response": "Mengecek jumlah deals yang aktif...",
  "requires_confirmation": false
}

User: "Halo"
Response: {
  "intent": "GREETING",
  "entities": {},
  "response": "Halo! Saya Asisten AI PelangganPro. Ada yang bisa saya bantu?",
  "requires_confirmation": false
}

INGAT:
- Selalu balas dalam Bahasa Indonesia yang natural
- Jika user bertanya tentang data, sebutkan bahwa kamu akan mencari datanya
- Jika action destructive (delete), selalu minta konfirmasi
- Jika tidak yakin dengan intent, gunakan UNKNOWN dan minta klarifikasi`;

export async function processMessageWithLLM(
  messages: Message[],
  context?: {
    org_id?: string;
    user_id?: string;
    recent_data?: any;
  }
): Promise<LLMResponse> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepSeek API error:", error);
      throw new Error("Failed to process message with LLM");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    
    return {
      intent: parsed.intent || "UNKNOWN",
      entities: parsed.entities || {},
      response: parsed.response || "Maaf, saya tidak mengerti. Bisa ulangi?",
      requires_confirmation: parsed.requires_confirmation || false,
      confirmation_message: parsed.confirmation_message || null,
    };
  } catch (error) {
    console.error("Error in processMessageWithLLM:", error);
    return {
      intent: "ERROR",
      entities: {},
      response: "Maaf, terjadi kesalahan. Silakan coba lagi.",
      requires_confirmation: false,
    };
  }
}

export async function generateResponseWithLLM(
  prompt: string,
  context?: any
): Promise<string> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "Kamu adalah Asisten AI PelangganPro. Berikan respons yang helpful dan natural dalam Bahasa Indonesia." 
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Maaf, saya tidak bisa menjawab saat ini.";
  } catch (error) {
    console.error("Error in generateResponseWithLLM:", error);
    return "Maaf, terjadi kesalahan. Silakan coba lagi.";
  }
}

// Generate natural response from tool execution result
export async function generateToolResponse(
  intent: string,
  toolResult: any,
  userQuery: string
): Promise<string> {
  try {
    const prompt = `User bertanya: "${userQuery}"

Sistem telah mengeksekusi action: ${intent}
Hasil eksekusi: ${JSON.stringify(toolResult, null, 2)}

Buat respons natural dalam Bahasa Indonesia yang menjelaskan hasil ini kepada user. Jelaskan dengan santai dan helpful, seolah-olah kamu membantu teman.`;

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "Kamu adalah Asisten AI PelangganPro. Berikan respons natural, santai, dan helpful dalam Bahasa Indonesia." 
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tool response");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || toolResult.message || "Berhasil mengeksekusi perintah.";
  } catch (error) {
    console.error("Error in generateToolResponse:", error);
    // Fallback to tool result message
    return toolResult.message || "Berhasil mengeksekusi perintah.";
  }
}

// Timeout wrapper for promises
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
