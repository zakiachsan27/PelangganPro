import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Tool, ToolContext, ToolResult, successResult, errorResult, progressResult } from "./types";

// Tool: Count entities (contacts, deals, tickets, tasks)
export const countEntitiesTool: Tool = {
  name: "count_entities",
  description: "Menghitung jumlah entity dalam database CRM. Gunakan tool ini ketika user bertanya 'berapa jumlah kontak/deal/ticket/task'. Parameter entity_type WAJIB diisi dengan salah satu nilai: 'contacts', 'deals', 'tickets', atau 'tasks'.",
  parameters: z.object({
    entity_type: z.enum(["contacts", "deals", "tickets", "tasks"])
      .describe("Entity type yang akan dihitung. Pilihan: 'contacts' (untuk menghitung kontak), 'deals' (untuk deal), 'tickets' (untuk ticket), 'tasks' (untuk task)"),
    filter: z.enum(["all", "active", "open"]).optional().describe("Filter opsional: 'all' (semua), 'active' (hanya deal aktif), 'open' (hanya ticket yang open)"),
  }),
  execute: async (args: { entity_type: string; filter?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      let query = supabase
        .from(args.entity_type)
        .select("*", { count: "exact", head: true })
        .eq("org_id", context.orgId);
      
      // Apply filters
      if (args.filter === "active" && args.entity_type === "deals") {
        // Exclude closed/won/lost deals
        // This requires joining with pipeline_stages, simplified here
        query = query.not("status", "in", "(closed_won,closed_lost)");
      }
      
      if (args.filter === "open" && args.entity_type === "tickets") {
        query = query.in("status", ["open", "in_progress"]);
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error("[countEntitiesTool] Error:", error);
        return errorResult("Gagal mengambil data dari database");
      }
      
      const entityLabels: Record<string, string> = {
        contacts: "kontak",
        deals: "deal",
        tickets: "ticket",
        tasks: "task",
      };
      
      const label = entityLabels[args.entity_type] || args.entity_type;
      const countNum = count || 0;
      
      return successResult(
        `Jumlah ${label}: ${countNum}`,
        `Anda memiliki ${countNum} ${label}${countNum !== 1 ? "" : ""}.`,
        { count: countNum }
      );
      
    } catch (error: any) {
      console.error("[countEntitiesTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Query contact by phone or name
export const queryContactTool: Tool = {
  name: "query_contact",
  description: "Mencari informasi kontak berdasarkan nomor telepon atau nama. Gunakan parameter 'phone' untuk mencari berdasarkan nomor telepon, atau 'name' untuk mencari berdasarkan nama.",
  parameters: z.object({
    phone: z.string().optional().describe("Nomor telepon kontak lengkap dengan kode negara (contoh: '628452318312'). Gunakan ini jika user menyebutkan nomor telepon."),
    name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Budi'). Gunakan ini jika user menyebutkan nama kontak."),
  }),
  execute: async (args: { phone?: string; name?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      let query = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone, email, status, lifetime_value, created_at")
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        query = query.eq("phone", args.phone);
      } else if (args.name) {
        query = query.or(`first_name.ilike.%${args.name}%,last_name.ilike.%${args.name}%`);
      } else {
        return errorResult("Harap berikan nomor telepon atau nama kontak");
      }
      
      const { data, error } = await query.limit(5);
      
      if (error) {
        console.error("[queryContactTool] Error:", error);
        return errorResult("Gagal mencari kontak");
      }
      
      if (!data || data.length === 0) {
        return successResult(
          "Kontak tidak ditemukan",
          `Maaf, tidak ada kontak yang cocok dengan pencarian Anda.`
        );
      }
      
      const contact = data[0];
      const fullName = `${contact.first_name} ${contact.last_name}`.trim();
      
      return successResult(
        `Kontak ditemukan: ${fullName} (${contact.phone || "no phone"}) - Status: ${contact.status}`,
        `**${fullName}**\n📱 ${contact.phone || "-"}\n📧 ${contact.email || "-"}\nStatus: ${contact.status}`,
        { contact }
      );
      
    } catch (error: any) {
      console.error("[queryContactTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Create note for contact
export const createNoteTool: Tool = {
  name: "create_note",
  description: "Membuat catatan/note untuk kontak tertentu. Wajib parameter 'content' untuk isi catatan. Opsional 'contact_phone' atau 'contact_name' untuk menentukan kontak yang akan diberi catatan.",
  parameters: z.object({
    contact_phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312'). Gunakan ini jika user menyebutkan nomor telepon kontak."),
    contact_name: z.string().optional().describe("Nama kontak (contoh: 'Budi Santoso'). Gunakan ini jika user menyebutkan nama kontak."),
    content: z.string().describe("Isi/catatan yang akan disimpan (wajib). Contoh: 'Meeting berjalan lancar'"),
  }),
  execute: async (args: { contact_phone?: string; contact_name?: string; content: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Find contact
      let contactQuery = supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .eq("org_id", context.orgId);
      
      if (args.contact_phone) {
        contactQuery = contactQuery.eq("phone", args.contact_phone);
      } else if (args.contact_name) {
        contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nomor telepon atau nama kontak");
      }
      
      const { data: contacts, error: contactError } = await contactQuery.limit(1);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const contact = contacts[0];
      
      // Create note
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .insert({
          org_id: context.orgId,
          contact_id: contact.id,
          content: args.content,
          author_id: context.userId,
        })
        .select()
        .single();
      
      if (noteError) {
        console.error("[createNoteTool] Error creating note:", noteError);
        return errorResult("Gagal membuat catatan");
      }
      
      const fullName = `${contact.first_name} ${contact.last_name}`.trim();
      
      return successResult(
        `Catatan berhasil dibuat untuk ${fullName}: ${args.content.substring(0, 50)}...`,
        `✅ Catatan berhasil dibuat untuk **${fullName}**`,
        { note }
      );
      
    } catch (error: any) {
      console.error("[createNoteTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Create task/reminder
export const createTaskTool: Tool = {
  name: "create_task",
  description: "Membuat task atau reminder untuk follow up atau todo list. Gunakan parameter 'title' untuk judul task dan 'due_date' untuk tanggal jatuh tempo.",
  parameters: z.object({
    title: z.string().describe("Judul/nama task (wajib). Contoh: 'Follow up dengan Budi'"),
    description: z.string().optional().describe("Deskripsi detail task (opsional)"),
    due_date: z.string().optional().describe("Tanggal jatuh tempo format YYYY-MM-DD (opsional). Contoh: '2025-03-15'. Default: hari ini"),
    contact_phone: z.string().optional().describe("Nomor telepon kontak terkait jika ada (contoh: '628452318312')"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium").describe("Prioritas task: 'low', 'medium', 'high', atau 'urgent'"),
  }),
  execute: async (args: { 
    title: string; 
    description?: string; 
    due_date?: string;
    contact_phone?: string;
    priority: string;
  }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Find contact if phone provided
      let contactId = null;
      if (args.contact_phone) {
        const { data: contacts } = await supabase
          .from("contacts")
          .select("id")
          .eq("org_id", context.orgId)
          .eq("phone", args.contact_phone)
          .limit(1);
        
        if (contacts && contacts.length > 0) {
          contactId = contacts[0].id;
        }
      }
      
      // Parse due date or default to today
      let dueDate = args.due_date;
      if (!dueDate) {
        dueDate = new Date().toISOString().split("T")[0];
      }
      
      // Create task
      const { data: task, error } = await supabase
        .from("tasks")
        .insert({
          org_id: context.orgId,
          title: args.title,
          description: args.description || "",
          due_date: dueDate,
          priority: args.priority,
          status: "todo",
          contact_id: contactId,
          assigned_to: context.userId,
        })
        .select()
        .single();
      
      if (error) {
        console.error("[createTaskTool] Error:", error);
        return errorResult("Gagal membuat task");
      }
      
      return successResult(
        `Task "${args.title}" berhasil dibuat dengan due date ${dueDate}`,
        `✅ Reminder "${args.title}" berhasil dibuat untuk tanggal ${dueDate}`,
        { task }
      );
      
    } catch (error: any) {
      console.error("[createTaskTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get pipeline summary
export const getPipelineSummaryTool: Tool = {
  name: "get_pipeline_summary",
  description: "Mendapatkan ringkasan/summary pipeline deals. Tool ini tidak memerlukan parameter apapun, langsung eksekusi saja ketika user bertanya tentang pipeline deals, sales pipeline, atau ringkasan deals.",
  parameters: z.object({}),
  execute: async (_args: {}, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Get all deals with their values
      const { data: deals, error } = await supabase
        .from("deals")
        .select("value, stage_id")
        .eq("org_id", context.orgId);
      
      if (error) {
        console.error("[getPipelineSummaryTool] Error:", error);
        return errorResult("Gagal mengambil data pipeline");
      }
      
      const totalDeals = deals?.length || 0;
      const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      
      return successResult(
        `Pipeline: ${totalDeals} deals dengan total value Rp ${totalValue.toLocaleString("id-ID")}`,
        `📊 **Pipeline Summary**\nTotal Deals: ${totalDeals}\nTotal Value: Rp ${totalValue.toLocaleString("id-ID")}`,
        { totalDeals, totalValue }
      );
      
    } catch (error: any) {
      console.error("[getPipelineSummaryTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Create ticket
export const createTicketTool: Tool = {
  name: "create_ticket",
  description: "Membuat ticket baru untuk kontak tertentu. Wajib parameter 'title' untuk judul ticket dan 'description' untuk deskripsi. Opsional 'contact_phone' atau 'contact_name', 'category', 'priority'.",
  parameters: z.object({
    title: z.string().describe("Judul ticket (wajib). Contoh: 'Website error di halaman kontak'"),
    description: z.string().describe("Deskripsi detail ticket (wajib). Contoh: 'User无法访问网站，显示500错误'"),
    contact_phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312')"),
    contact_name: z.string().optional().describe("Nama kontak (contoh: 'Budi Santoso')"),
    category: z.enum(["bug", "feature_request", "pertanyaan", "keluhan_pelanggan", "internal"]).optional().describe("Kategori ticket. Default: 'pertanyaan'"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("Prioritas ticket. Default: 'medium'"),
  }),
  execute: async (args: {
    title: string;
    description: string;
    contact_phone?: string;
    contact_name?: string;
    category?: string;
    priority?: string;
  }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Find contact if provided
      let contactId = null;
      if (args.contact_phone || args.contact_name) {
        let contactQuery = supabase.from("contacts").select("id, first_name, last_name").eq("org_id", context.orgId);
        
        if (args.contact_phone) {
          contactQuery = contactQuery.eq("phone", args.contact_phone);
        } else if (args.contact_name) {
          contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
        }
        
        const { data: contacts } = await contactQuery.limit(1);
        if (contacts && contacts.length > 0) {
          contactId = contacts[0].id;
        }
      }
      
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          org_id: context.orgId,
          title: args.title,
          description: args.description,
          category: args.category || "pertanyaan",
          priority: args.priority || "medium",
          status: "open",
          contact_id: contactId,
          reporter_id: context.userId,
        })
        .select()
        .single();
      
      if (ticketError) {
        console.error("[createTicketTool] Error:", ticketError);
        return errorResult(`Gagal membuat ticket: ${ticketError.message}`);
      }
      
      return successResult(
        `Ticket berhasil dibuat: ${args.title}`,
        `✅ Ticket berhasil dibuat!\n\n**${args.title}**\nKategori: ${args.category || 'pertanyaan'}\nPrioritas: ${args.priority || 'medium'}`,
        { ticket }
      );
      
    } catch (error: any) {
      console.error("[createTicketTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Export all tools
export const allTools = [
  countEntitiesTool,
  queryContactTool,
  createNoteTool,
  createTaskTool,
  createTicketTool,
  getPipelineSummaryTool,
];
