import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Tool, ToolContext, ToolResult, successResult, errorResult } from "./types";

// Tool: Get tickets by contact
export const getContactTicketsTool: Tool = {
  name: "get_contact_tickets",
  description: "Mendapatkan daftar tiket/ticket untuk kontak tertentu dengan SEMUA detail (title, deskripsi, status, priority, kategori). Tool ini CUKUP untuk menjawab pertanyaan 'ada tiket apa untuk X'. LANGSUNG jawab user setelah tool ini berhasil, TIDAK PERLU panggil get_ticket_detail.",
  parameters: z.object({
    contact_name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Bu Yani'). Gunakan jika user menyebutkan nama."),
    phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312'). Gunakan jika user menyebutkan nomor telepon."),
    status: z.enum(["open", "in_progress", "waiting", "resolved", "closed", "all"]).optional().describe("Filter status tiket. Default: 'all' untuk semua status"),
  }),
  execute: async (args: { contact_name?: string; phone?: string; status?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Find contact first
      let contactQuery = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        contactQuery = contactQuery.eq("phone", args.phone);
      } else if (args.contact_name) {
        contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nama kontak atau nomor telepon");
      }
      
      const { data: contacts, error: contactError } = await contactQuery.limit(1);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const contact = contacts[0];
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get tickets for this contact
      console.log(`[getContactTicketsTool] Looking for tickets of contact ${contact.id} in org ${context.orgId}`);
      let ticketsQuery = supabase
        .from("tickets")
        .select("id, title, description, category, priority, status, created_at, resolved_at")
        .eq("org_id", context.orgId)
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false });
      
      // Apply status filter
      if (args.status && args.status !== "all") {
        ticketsQuery = ticketsQuery.eq("status", args.status);
      }
      
      const { data: tickets, error: ticketsError } = await ticketsQuery.limit(10);
      
      if (ticketsError) {
        console.error("[getContactTicketsTool] Error:", ticketsError);
        console.error("[getContactTicketsTool] Error code:", ticketsError.code);
        console.error("[getContactTicketsTool] Error message:", ticketsError.message);
        return errorResult(`Gagal mengambil data tiket: ${ticketsError.message}`);
      }
      
      if (!tickets || tickets.length === 0) {
        return successResult(
          `Tidak ada tiket untuk ${fullName}`,
          `Kontak **${fullName}** tidak memiliki tiket yang tercatat di sistem.`
        );
      }
      
      // Format ticket list dengan deskripsi LENGKAP - JANGAN UBAH/TAMBAH
      const ticketList = tickets.map((t: any, idx: number) => {
        const desc = t.description ? `\n   [DESKRIPSI ASLI DARI DATABASE]:\n   ${t.description}` : "";
        return `=== TIKET ${idx + 1} ===\nJudul: ${t.title}\nStatus: ${t.status}\nPrioritas: ${t.priority}\nKategori: ${t.category}${desc}\n=== END TIKET ${idx + 1} ===`;
      }).join("\n\n");
      
      return successResult(
        `DATA TIKET ${fullName} (TAMPILKAN APA ADANYA, JANGAN TAMBAH/HAPUS):\n\n${ticketList}`,
        `**Tiket untuk ${fullName}:**\n\n${ticketList}`,
        { tickets, contact }
      );
      
    } catch (error: any) {
      console.error("[getContactTicketsTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get deals by contact
export const getContactDealsTool: Tool = {
  name: "get_contact_deals",
  description: "Mendapatkan daftar deals untuk kontak tertentu. Gunakan tool ini ketika user bertanya 'apa dealsnya Bu Yani', 'transaksi siapa', atau pertanyaan tentang deal dari kontak spesifik.",
  parameters: z.object({
    contact_name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Bu Yani')"),
    phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312')"),
    status: z.enum(["open", "won", "lost", "all"]).optional().describe("Filter status deal. Default: 'all' untuk semua status"),
  }),
  execute: async (args: { contact_name?: string; phone?: string; status?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Find contact first
      let contactQuery = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        contactQuery = contactQuery.eq("phone", args.phone);
      } else if (args.contact_name) {
        contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nama kontak atau nomor telepon");
      }
      
      const { data: contacts, error: contactError } = await contactQuery.limit(1);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const contact = contacts[0];
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get deals for this contact
      let dealsQuery = supabase
        .from("deals")
        .select(`
          id, 
          title, 
          value, 
          currency, 
          status, 
          expected_close_date,
          pipeline_stages (name, is_won, is_lost)
        `)
        .eq("org_id", context.orgId)
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false });
      
      // Apply status filter
      if (args.status && args.status !== "all") {
        dealsQuery = dealsQuery.eq("status", args.status);
      }
      
      const { data: deals, error: dealsError } = await dealsQuery.limit(10);
      
      if (dealsError) {
        console.error("[getContactDealsTool] Error:", dealsError);
        return errorResult("Gagal mengambil data deals");
      }
      
      if (!deals || deals.length === 0) {
        return successResult(
          `Tidak ada deals untuk ${fullName}`,
          `Kontak **${fullName}** tidak memiliki deal yang tercatat di sistem.`
        );
      }
      
      // Format deals list WITH IDs for LLM to use in subsequent calls
      const dealsListForUser = deals.map((d: any, idx: number) => {
        const value = d.value ? `Rp ${d.value.toLocaleString("id-ID")}` : "Tidak ada nilai";
        return `${idx + 1}. **${d.title}**\n   Nilai: ${value} | Status: ${d.status}`;
      }).join("\n\n");
      
      // Include deal IDs in forLLM so AI can reference them
      const dealsListForLLM = deals.map((d: any, idx: number) => {
        const value = d.value ? `Rp ${d.value.toLocaleString("id-ID")}` : "Tidak ada nilai";
        return `${idx + 1}. **${d.title}** (ID: ${d.id})\n   Nilai: ${value} | Status: ${d.status}`;
      }).join("\n\n");
      
      const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
      
      return successResult(
        `Ditemukan ${deals.length} deals untuk ${fullName} dengan total nilai Rp ${totalValue.toLocaleString("id-ID")}. Deal IDs: ${deals.map((d: any) => d.id).join(", ")}`,
        `**Deals untuk ${fullName}:**\n\n${dealsListForUser}\n\n**Total Nilai:** Rp ${totalValue.toLocaleString("id-ID")}`,
        { deals, contact, totalValue }
      );
      
    } catch (error: any) {
      console.error("[getContactDealsTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get notes by contact
export const getContactNotesTool: Tool = {
  name: "get_contact_notes",
  description: "Mendapatkan catatan/note untuk kontak tertentu. Gunakan tool ini ketika user bertanya 'apa catatannya Bu Yani', 'note siapa', atau ingin melihat riwayat catatan kontak.",
  parameters: z.object({
    contact_name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Bu Yani')"),
    phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312')"),
    limit: z.number().optional().describe("Jumlah catatan yang ingin ditampilkan. Default: 5"),
  }),
  execute: async (args: { contact_name?: string; phone?: string; limit?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Find contact first
      let contactQuery = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        contactQuery = contactQuery.eq("phone", args.phone);
      } else if (args.contact_name) {
        contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nama kontak atau nomor telepon");
      }
      
      const { data: contacts, error: contactError } = await contactQuery.limit(1);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const contact = contacts[0];
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get notes for this contact (without FK join)
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select(`
          id,
          content,
          created_at,
          created_by
        `)
        .eq("org_id", context.orgId)
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false })
        .limit(args.limit || 5);
      
      if (notesError) {
        console.error("[getContactNotesTool] Error:", notesError);
        return errorResult("Gagal mengambil data catatan");
      }
      
      if (!notesData || notesData.length === 0) {
        return successResult(
          `Tidak ada catatan untuk ${fullName}`,
          `Kontak **${fullName}** belum memiliki catatan di sistem.`
        );
      }
      
      // Get authors separately
      const authorIds = [...new Set(notesData.map((n: any) => n.created_by).filter(Boolean))];
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", authorIds);
      
      const authorMap = new Map(authors?.map((a: any) => [a.id, a]) || []);
      const notes = notesData.map((n: any) => ({
        ...n,
        author: authorMap.get(n.created_by) || null,
      }));
      
      // Format notes list
      const notesList = notes.map((n: any, idx: number) => {
        const date = new Date(n.created_at).toLocaleDateString("id-ID");
        const authorName = n.author ? `${n.author.first_name} ${n.author.last_name || ""}`.trim() : "System";
        return `${idx + 1}. **${date}** oleh ${authorName}\n   ${n.content.substring(0, 100)}${n.content.length > 100 ? "..." : ""}`;
      }).join("\n\n");
      
      return successResult(
        `Ditemukan ${notes.length} catatan untuk ${fullName}`,
        `**Catatan untuk ${fullName}:**\n\n${notesList}`,
        { notes, contact }
      );
      
    } catch (error: any) {
      console.error("[getContactNotesTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get tasks by contact
export const getContactTasksTool: Tool = {
  name: "get_contact_tasks",
  description: "Mendapatkan daftar task/todo untuk kontak tertentu dengan SEMUA detail (title, deskripsi, due date, status, priority). Gunakan tool ini ketika user bertanya 'apa tasknya Bu Yani', 'reminder siapa', atau tugas dari kontak spesifik. Data yang dikembalikan sudah lengkap, tidak perlu memanggil tool lain.",
  parameters: z.object({
    contact_name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Bu Yani')"),
    phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312')"),
    status: z.enum(["todo", "in_progress", "done", "cancelled", "all"]).optional().describe("Filter status task. Default: 'all' untuk semua status"),
  }),
  execute: async (args: { contact_name?: string; phone?: string; status?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Find contact first
      let contactQuery = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        contactQuery = contactQuery.eq("phone", args.phone);
      } else if (args.contact_name) {
        contactQuery = contactQuery.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nama kontak atau nomor telepon");
      }
      
      const { data: contacts, error: contactError } = await contactQuery.limit(1);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const contact = contacts[0];
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get tasks for this contact
      let tasksQuery = supabase
        .from("tasks")
        .select("id, title, description, due_date, priority, status, created_at")
        .eq("org_id", context.orgId)
        .eq("contact_id", contact.id)
        .order("due_date", { ascending: true });
      
      // Apply status filter
      if (args.status && args.status !== "all") {
        tasksQuery = tasksQuery.eq("status", args.status);
      }
      
      const { data: tasks, error: tasksError } = await tasksQuery.limit(10);
      
      if (tasksError) {
        console.error("[getContactTasksTool] Error:", tasksError);
        return errorResult("Gagal mengambil data task");
      }
      
      if (!tasks || tasks.length === 0) {
        return successResult(
          `Tidak ada task untuk ${fullName}`,
          `Kontak **${fullName}** tidak memiliki task yang tercatat di sistem.`
        );
      }
      
      // Format tasks list dengan detail LENGKAP
      const tasksListDetailed = tasks.map((t: any, idx: number) => {
        const dueDate = t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID") : "Tanpa deadline";
        const statusIcon = t.status === "done" ? "✅" : t.status === "todo" ? "⏳" : "🔄";
        const priorityLabel = t.priority === "urgent" ? "🔴 Urgent" : t.priority === "high" ? "🟠 High" : t.priority === "medium" ? "🟡 Medium" : "🟢 Low";
        const description = t.description ? `\n   📝 ${t.description}` : "";
        
        return `${idx + 1}. ${statusIcon} **${t.title}**\n   📅 Due: ${dueDate} | ${priorityLabel} | Status: ${t.status}${description}`;
      }).join("\n\n");
      
      return successResult(
        `Ditemukan ${tasks.length} task untuk ${fullName}: ${tasks.map((t: any) => `${t.title} (due: ${t.due_date || 'N/A'}, status: ${t.status})`).join(", ")}`,
        `**Task untuk ${fullName}:**\n\n${tasksListDetailed}`,
        { tasks, contact }
      );
      
    } catch (error: any) {
      console.error("[getContactTasksTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get all tickets
export const listTicketsTool: Tool = {
  name: "list_tickets",
  description: "Mendapatkan daftar semua tiket/ticket di sistem. Gunakan tool ini untuk melihat tiket terbaru atau tiket dengan filter tertentu.",
  parameters: z.object({
    status: z.enum(["open", "in_progress", "waiting", "resolved", "closed", "all"]).optional().describe("Filter status tiket. Default: 'all' untuk semua status"),
    priority: z.enum(["low", "medium", "high", "urgent", "all"]).optional().describe("Filter prioritas tiket. Default: 'all' untuk semua prioritas"),
    limit: z.number().optional().describe("Jumlah tiket yang ingin ditampilkan. Default: 10"),
  }),
  execute: async (args: { status?: string; priority?: string; limit?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      let query = supabase
        .from("tickets")
        .select(`
          id,
          title,
          description,
          category,
          priority,
          status,
          created_at,
          contact:contacts (first_name, last_name, phone)
        `)
        .eq("org_id", context.orgId)
        .order("created_at", { ascending: false });
      
      // Apply filters
      if (args.status && args.status !== "all") {
        query = query.eq("status", args.status);
      }
      
      if (args.priority && args.priority !== "all") {
        query = query.eq("priority", args.priority);
      }
      
      const { data: tickets, error } = await query.limit(args.limit || 10);
      
      if (error) {
        console.error("[listTicketsTool] Error:", error);
        return errorResult("Gagal mengambil data tiket");
      }
      
      if (!tickets || tickets.length === 0) {
        return successResult(
          "Tidak ada tiket ditemukan",
          "Tidak ada tiket yang sesuai dengan filter yang diberikan."
        );
      }
      
      // Format tickets list dengan deskripsi
      const ticketsListForUser = tickets.map((t: any, idx: number) => {
        const contactData = Array.isArray(t.contact) ? t.contact[0] : t.contact;
        const contactName = contactData 
          ? `${contactData.first_name} ${contactData.last_name || ""}`.trim()
          : "Tidak ada kontak";
        const desc = t.description ? `\n   📝 ${t.description.substring(0, 100)}${t.description.length > 100 ? "..." : ""}` : "";
        return `${idx + 1}. **${t.title}**\n   Kontak: ${contactName} | Status: ${t.status} | Prioritas: ${t.priority}${desc}`;
      }).join("\n\n");
      
      // Include full data for LLM
      const ticketsListForLLM = tickets.map((t: any, idx: number) => {
        const contactData = Array.isArray(t.contact) ? t.contact[0] : t.contact;
        const contactName = contactData 
          ? `${contactData.first_name} ${contactData.last_name || ""}`.trim()
          : "Tidak ada kontak";
        const desc = t.description ? `\n   Deskripsi: ${t.description}` : "";
        return `${idx + 1}. **${t.title}** (ID: ${t.id})\n   Kontak: ${contactName} | Status: ${t.status} | Prioritas: ${t.priority}${desc}`;
      }).join("\n\n");
      
      return successResult(
        `Ditemukan ${tickets.length} tiket: ${tickets.map((t: any) => `${t.title} - ${t.description?.substring(0, 50) || 'no desc'}...`).join("; ")}`,
        `**Daftar Tiket:**\n\n${ticketsListForUser}`,
        { tickets }
      );
      
    } catch (error: any) {
      console.error("[listTicketsTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get all deals
export const listDealsTool: Tool = {
  name: "list_deals",
  description: "Mendapatkan daftar semua deals di pipeline. Gunakan tool ini untuk melihat deal terbaru atau deal dengan filter tertentu.",
  parameters: z.object({
    status: z.enum(["open", "won", "lost", "all"]).optional().describe("Filter status deal. Default: 'all' untuk semua status"),
    limit: z.number().optional().describe("Jumlah deal yang ingin ditampilkan. Default: 10"),
  }),
  execute: async (args: { status?: string; limit?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      let query = supabase
        .from("deals")
        .select(`
          id,
          title,
          value,
          currency,
          status,
          expected_close_date,
          pipeline_stages (name),
          contact:contacts (first_name, last_name)
        `)
        .eq("org_id", context.orgId)
        .order("created_at", { ascending: false });
      
      // Apply status filter
      if (args.status && args.status !== "all") {
        query = query.eq("status", args.status);
      }
      
      const { data: deals, error } = await query.limit(args.limit || 10);
      
      if (error) {
        console.error("[listDealsTool] Error:", error);
        return errorResult("Gagal mengambil data deals");
      }
      
      if (!deals || deals.length === 0) {
        return successResult(
          "Tidak ada deals ditemukan",
          "Tidak ada deals yang sesuai dengan filter yang diberikan."
        );
      }
      
      // Format deals list WITH IDs for LLM to use in subsequent calls
      const dealsListForUser = deals.map((d: any, idx: number) => {
        const contactData = Array.isArray(d.contact) ? d.contact[0] : d.contact;
        const contactName = contactData 
          ? `${contactData.first_name} ${contactData.last_name || ""}`.trim()
          : "Tidak ada kontak";
        const value = d.value ? `Rp ${d.value.toLocaleString("id-ID")}` : "-";
        return `${idx + 1}. **${d.title}**\n   Nilai: ${value} | Kontak: ${contactName} | Status: ${d.status}`;
      }).join("\n\n");
      
      // Include deal IDs in forLLM so AI can reference them
      const dealsListForLLM = deals.map((d: any, idx: number) => {
        const contactData = Array.isArray(d.contact) ? d.contact[0] : d.contact;
        const contactName = contactData 
          ? `${contactData.first_name} ${contactData.last_name || ""}`.trim()
          : "Tidak ada kontak";
        const value = d.value ? `Rp ${d.value.toLocaleString("id-ID")}` : "-";
        return `${idx + 1}. **${d.title}** (ID: ${d.id})\n   Nilai: ${value} | Kontak: ${contactName} | Status: ${d.status}`;
      }).join("\n\n");
      
      const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
      
      return successResult(
        `Ditemukan ${deals.length} deals dengan total nilai Rp ${totalValue.toLocaleString("id-ID")}. Deal IDs: ${deals.map((d: any) => d.id).join(", ")}`,
        `**Daftar Deals:**\n\n${dealsListForUser}\n\n**Total Nilai:** Rp ${totalValue.toLocaleString("id-ID")}`,
        { deals, totalValue }
      );
      
    } catch (error: any) {
      console.error("[listDealsTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Get recent activities
export const getRecentActivitiesTool: Tool = {
  name: "get_recent_activities",
  description: "Mendapatkan aktivitas terbaru di sistem CRM. Gunakan tool ini untuk melihat history aktivitas seperti deal created, contact updated, note added, dll.",
  parameters: z.object({
    entity_type: z.enum(["contact", "deal", "company", "task", "ticket", "all"]).optional().describe("Filter jenis entity. Default: 'all' untuk semua jenis"),
    limit: z.number().optional().describe("Jumlah aktivitas yang ingin ditampilkan. Default: 10"),
  }),
  execute: async (args: { entity_type?: string; limit?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Get activities without FK join to avoid schema issues
      let query = supabase
        .from("activities")
        .select(`
          id,
          entity_type,
          entity_id,
          action,
          details,
          created_at,
          actor_id
        `)
        .eq("org_id", context.orgId)
        .order("created_at", { ascending: false });
      
      // Apply filter
      if (args.entity_type && args.entity_type !== "all") {
        query = query.eq("entity_type", args.entity_type);
      }
      
      const { data: activities, error } = await query.limit(args.limit || 10);
      
      if (error) {
        console.error("[getRecentActivitiesTool] Error:", error);
        return errorResult("Gagal mengambil data aktivitas");
      }
      
      if (!activities || activities.length === 0) {
        return successResult(
          "Tidak ada aktivitas ditemukan",
          "Belum ada aktivitas yang tercatat di sistem."
        );
      }
      
      // Get actor names separately
      const actorIds = activities.map((a: any) => a.actor_id).filter(Boolean);
      const { data: actors } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", actorIds);
      
      const actorMap = new Map(actors?.map((p: any) => [p.id, p]) || []);
      
      // Format activities list
      const activitiesList = activities.map((a: any, idx: number) => {
        const date = new Date(a.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
        const actor = actorMap.get(a.actor_id);
        const actorName = actor 
          ? `${actor.first_name} ${actor.last_name || ""}`.trim()
          : "System";
        return `${idx + 1}. **${date}**\n   ${actorName} ${a.action} ${a.entity_type}`;
      }).join("\n\n");
      
      return successResult(
        `Ditemukan ${activities.length} aktivitas terbaru`,
        `**Aktivitas Terbaru:**\n\n${activitiesList}`,
        { activities }
      );
      
    } catch (error: any) {
      console.error("[getRecentActivitiesTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Search tasks by contact name (optimized for natural language queries)
export const searchTasksByContactTool: Tool = {
  name: "search_tasks_by_contact",
  description: "Mencari task/todo untuk kontak berdasarkan nama dengan SEMUA detail lengkap. Tool ini COCOK untuk pertanyaan seperti 'ada task apa untuk Miss Bella', 'tugas Bu Yani apa saja', 'reminder siapa'. Data yang dikembalikan sudah lengkap dengan deskripsi, due date, status, dan priority.",
  parameters: z.object({
    contact_name: z.string().min(1).describe("Nama kontak yang dicari. Contoh: 'Miss Bella', 'Bu Yani', 'Pak Budi'. WAJIB diisi."),
    status: z.enum(["todo", "in_progress", "done", "cancelled", "all"]).optional().describe("Filter status task. Default: 'all' untuk semua status"),
  }),
  execute: async (args: { contact_name: string; status?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Search contact by name (flexible search)
      const { data: contacts, error: contactError } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .eq("org_id", context.orgId)
        .or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`)
        .limit(5);
      
      if (contactError || !contacts || contacts.length === 0) {
        return errorResult(`Tidak menemukan kontak dengan nama "${args.contact_name}"`);
      }
      
      // Ambil kontak pertama yang paling cocok
      const contact = contacts[0];
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get tasks for this contact
      let tasksQuery = supabase
        .from("tasks")
        .select("id, title, description, due_date, priority, status, created_at")
        .eq("org_id", context.orgId)
        .eq("contact_id", contact.id)
        .order("due_date", { ascending: true });
      
      // Apply status filter
      if (args.status && args.status !== "all") {
        tasksQuery = tasksQuery.eq("status", args.status);
      }
      
      const { data: tasks, error: tasksError } = await tasksQuery.limit(20);
      
      if (tasksError) {
        console.error("[searchTasksByContactTool] Error:", tasksError);
        return errorResult("Gagal mengambil data task");
      }
      
      if (!tasks || tasks.length === 0) {
        return successResult(
          `Tidak ada task untuk ${fullName}`,
          `**${fullName}** tidak memiliki task yang tercatat di sistem.`,
          { contact, tasks: [] }
        );
      }
      
      // Format tasks list dengan detail LENGKAP
      const tasksList = tasks.map((t: any, idx: number) => {
        const dueDate = t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID") : "Tanpa deadline";
        const statusIcon = t.status === "done" ? "✅" : t.status === "todo" ? "⏳" : "🔄";
        const priorityLabel = t.priority === "urgent" ? "🔴 Urgent" : t.priority === "high" ? "🟠 High" : t.priority === "medium" ? "🟡 Medium" : "🟢 Low";
        const description = t.description ? `\n   📝 ${t.description}` : "";
        
        return `${idx + 1}. ${statusIcon} **${t.title}**\n   📅 Due: ${dueDate} | ${priorityLabel} | Status: ${t.status}${description}`;
      }).join("\n\n");
      
      return successResult(
        `Ditemukan ${tasks.length} task untuk ${fullName}: ${tasks.map((t: any) => `${t.title} (due: ${t.due_date || 'N/A'}, status: ${t.status})`).join(", ")}`,
        `**Task untuk ${fullName}:**\n\n${tasksList}`,
        { tasks, contact }
      );
      
    } catch (error: any) {
      console.error("[searchTasksByContactTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Tool: Search contacts by name (for better discovery)
export const searchContactsTool: Tool = {
  name: "search_contacts",
  description: "Mencari kontak berdasarkan nama. Gunakan tool ini untuk mencari kontak sebelum melakukan operasi lain.",
  parameters: z.object({
    name: z.string().describe("Nama kontak yang dicari (bisa partial). Contoh: 'Bella', 'Yani', 'Budi'."),
    limit: z.number().optional().describe("Jumlah hasil maksimal. Default: 5"),
  }),
  execute: async (args: { name: string; limit?: number }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      
      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, phone, email, status")
        .eq("org_id", context.orgId)
        .or(`first_name.ilike.%${args.name}%,last_name.ilike.%${args.name}%`)
        .limit(args.limit || 5);
      
      if (error) {
        console.error("[searchContactsTool] Error:", error);
        return errorResult("Gagal mencari kontak");
      }
      
      if (!contacts || contacts.length === 0) {
        return successResult(
          `Tidak ada kontak dengan nama "${args.name}"`,
          `Tidak menemukan kontak yang cocok dengan "${args.name}".`
        );
      }
      
      // Format contacts list
      const contactsList = contacts.map((c: any, idx: number) => {
        const fullName = `${c.first_name} ${c.last_name || ""}`.trim();
        return `${idx + 1}. **${fullName}**${c.phone ? ` 📱 ${c.phone}` : ""}`;
      }).join("\n");
      
      return successResult(
        `Ditemukan ${contacts.length} kontak`,
        `**Kontak ditemukan:**\n\n${contactsList}`,
        { contacts }
      );
      
    } catch (error: any) {
      console.error("[searchContactsTool] Exception:", error);
      return errorResult(error.message || "Terjadi kesalahan");
    }
  },
};

// Export all query tools
export const queryTools = [
  getContactTicketsTool,
  getContactDealsTool,
  getContactNotesTool,
  getContactTasksTool,
  listTicketsTool,
  listDealsTool,
  getRecentActivitiesTool,
  searchTasksByContactTool,
  searchContactsTool,
];
