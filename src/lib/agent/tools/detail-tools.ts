import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Tool, ToolContext, ToolResult, successResult, errorResult } from "./types";

// Tool: Get ticket detail with comments
export const getTicketDetailTool: Tool = {
  name: "get_ticket_detail",
  description: "Mendapatkan detail lengkap tiket/ticket termasuk deskripsi, komentar, dan status. Gunakan tool ini ketika user bertanya 'detail tiket X', 'isi tiketnya apa', atau ingin melihat detail spesifik suatu tiket.",
  parameters: z.object({
    ticket_id: z.string().describe("ID tiket yang ingin dilihat detailnya (UUID format)"),
  }),
  execute: async (args: { ticket_id: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      console.log(`[getTicketDetailTool] Fetching ticket ${args.ticket_id} for org ${context.orgId}`);
      
      // Get ticket data only (no FK joins)
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          *,
          contact:contacts(id, first_name, last_name, phone, email)
        `)
        .eq("id", args.ticket_id)
        .eq("org_id", context.orgId)
        .single();
      
      if (ticketError || !ticket) {
        console.error(`[getTicketDetailTool] Error:`, ticketError);
        return errorResult(`Tiket tidak ditemukan: ${ticketError?.message || "Unknown error"}`);
      }
      
      // Get assignee and reporter separately
      const [assigneeRes, reporterRes] = await Promise.all([
        ticket.assignee_id ? supabase.from("profiles").select("first_name, last_name").eq("id", ticket.assignee_id).single() : { data: null },
        ticket.reporter_id ? supabase.from("profiles").select("first_name, last_name").eq("id", ticket.reporter_id).single() : { data: null },
      ]);
      
      // Get comments without FK join
      const { data: commentsData } = await supabase
        .from("ticket_comments")
        .select("*")
        .eq("ticket_id", args.ticket_id)
        .order("created_at", { ascending: true });
      
      // Get comment authors separately
      let comments = commentsData || [];
      if (comments.length > 0) {
        const authorIds = [...new Set(comments.map((c: any) => c.author_id).filter(Boolean))];
        const { data: authors } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", authorIds);
        
        const authorMap = new Map(authors?.map((a: any) => [a.id, a]) || []);
        comments = comments.map((c: any) => ({
          ...c,
          author: authorMap.get(c.author_id) || null,
        }));
      }
      
      // Format response
      const contact = ticket.contact?.[0] || ticket.contact;
      const assignee = assigneeRes.data;
      const reporter = reporterRes.data;
      
      let detailText = `**${ticket.title}**\n\n`;
      detailText += `**Status:** ${ticket.status}\n`;
      detailText += `**Prioritas:** ${ticket.priority}\n`;
      detailText += `**Kategori:** ${ticket.category}\n`;
      detailText += `**Kontak:** ${contact ? `${contact.first_name} ${contact.last_name || ""}`.trim() : "Tidak ada"}\n`;
      detailText += `**Assignee:** ${assignee ? `${assignee.first_name} ${assignee.last_name || ""}`.trim() : "Belum di-assign"}\n`;
      detailText += `**Reporter:** ${reporter ? `${reporter.first_name} ${reporter.last_name || ""}`.trim() : "System"}\n`;
      detailText += `**Dibuat:** ${new Date(ticket.created_at).toLocaleString("id-ID")}\n\n`;
      detailText += `**Deskripsi:**\n${ticket.description || "Tidak ada deskripsi"}\n`;
      
      if (comments && comments.length > 0) {
        detailText += `\n**Komentar (${comments.length}):**\n\n`;
        comments.forEach((c: any, idx: number) => {
          const authorName = c.author ? `${c.author.first_name} ${c.author.last_name || ""}`.trim() : "System";
          detailText += `${idx + 1}. **${authorName}** (${new Date(c.created_at).toLocaleString("id-ID")}):\n   ${c.content}\n\n`;
        });
      }
      
      return successResult(
        `Detail tiket: ${ticket.title}`,
        detailText,
        { ticket, comments }
      );
      
    } catch (error: any) {
      console.error("[getTicketDetailTool] Exception:", error);
      return errorResult(`Error: ${error.message}`);
    }
  },
};

// Tool: Get deal detail
export const getDealDetailTool: Tool = {
  name: "get_deal_detail",
  description: "Mendapatkan detail lengkap deal termasuk nilai, stage, dan riwayat.",
  parameters: z.object({
    deal_id: z.string().describe("ID deal yang ingin dilihat detailnya (UUID format)"),
  }),
  execute: async (args: { deal_id: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Get deal without FK joins to profiles
      const { data: deal, error: dealError } = await supabase
        .from("deals")
        .select(`
          *,
          contact:contacts(id, first_name, last_name, phone, email),
          company:companies(id, name),
          pipeline_stages(id, name, is_won, is_lost)
        `)
        .eq("id", args.deal_id)
        .eq("org_id", context.orgId)
        .single();
      
      if (dealError || !deal) {
        return errorResult(`Deal tidak ditemukan: ${dealError?.message}`);
      }
      
      // Get owner separately
      const { data: owner } = deal.owner_id 
        ? await supabase.from("profiles").select("first_name, last_name").eq("id", deal.owner_id).single()
        : { data: null };
      
      // Get notes without FK join
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("deal_id", args.deal_id)
        .eq("org_id", context.orgId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      // Get note authors separately
      let notes = notesData || [];
      if (notes.length > 0) {
        const authorIds = [...new Set(notes.map((n: any) => n.created_by).filter(Boolean))];
        const { data: authors } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", authorIds);
        
        const authorMap = new Map(authors?.map((a: any) => [a.id, a]) || []);
        notes = notes.map((n: any) => ({
          ...n,
          author: authorMap.get(n.created_by) || null,
        }));
      }
      
      const contact = deal.contact?.[0] || deal.contact;
      const stage = deal.pipeline_stages?.[0] || deal.pipeline_stages;
      
      let detailText = `**${deal.title}**\n\n`;
      detailText += `**Nilai:** Rp ${(deal.value || 0).toLocaleString("id-ID")}\n`;
      detailText += `**Status:** ${deal.status}\n`;
      detailText += `**Stage:** ${stage?.name || "Unknown"}\n`;
      detailText += `**Kontak:** ${contact ? `${contact.first_name} ${contact.last_name || ""}`.trim() : "-"}\n`;
      detailText += `**Owner:** ${owner ? `${owner.first_name} ${owner.last_name || ""}`.trim() : "-"}\n`;
      detailText += `**Expected Close:** ${deal.expected_close_date || "-"}\n\n`;
      
      if (notes && notes.length > 0) {
        detailText += `**Catatan (${notes.length}):**\n\n`;
        notes.forEach((n: any) => {
          const authorName = n.author ? `${n.author.first_name} ${n.author.last_name || ""}`.trim() : "System";
          detailText += `• ${new Date(n.created_at).toLocaleDateString("id-ID")} - ${authorName}:\n  ${n.content?.substring(0, 100) || ""}${n.content?.length > 100 ? "..." : ""}\n\n`;
        });
      }
      
      return successResult(`Detail deal: ${deal.title}`, detailText, { deal, notes });
      
    } catch (error: any) {
      return errorResult(`Error: ${error.message}`);
    }
  },
};

// Tool: Get note detail
export const getNoteDetailTool: Tool = {
  name: "get_note_detail",
  description: "Mendapatkan detail lengkap catatan/note.",
  parameters: z.object({
    note_id: z.string().describe("ID catatan yang ingin dilihat detailnya (UUID format)"),
  }),
  execute: async (args: { note_id: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Get note without FK joins to profiles
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .select(`
          *,
          contact:contacts(id, first_name, last_name),
          deal:deals(id, title),
          company:companies(id, name)
        `)
        .eq("id", args.note_id)
        .eq("org_id", context.orgId)
        .single();
      
      if (noteError || !note) {
        return errorResult(`Catatan tidak ditemukan: ${noteError?.message}`);
      }
      
      // Get author separately
      const { data: author } = note.created_by
        ? await supabase.from("profiles").select("first_name, last_name").eq("id", note.created_by).single()
        : { data: null };
      
      let detailText = `**Catatan**\n\n${note.content}\n\n---\n`;
      detailText += `**Dibuat oleh:** ${author ? `${author.first_name} ${author.last_name || ""}`.trim() : "System"}\n`;
      detailText += `**Tanggal:** ${new Date(note.created_at).toLocaleString("id-ID")}\n`;
      
      return successResult("Detail catatan", detailText, { note });
      
    } catch (error: any) {
      return errorResult(`Error: ${error.message}`);
    }
  },
};

// Tool: Get task detail
export const getTaskDetailTool: Tool = {
  name: "get_task_detail",
  description: "Mendapatkan detail lengkap task/todo.",
  parameters: z.object({
    task_id: z.string().describe("ID task yang ingin dilihat detailnya (UUID format)"),
  }),
  execute: async (args: { task_id: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select(`
          *,
          contact:contacts(id, first_name, last_name),
          deal:deals(id, title)
        `)
        .eq("id", args.task_id)
        .eq("org_id", context.orgId)
        .single();
      
      // Get assignee separately to avoid FK issues
      let assignee = null;
      if (task?.assigned_to) {
        const { data: assigneeData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("id", task.assigned_to)
          .single();
        assignee = assigneeData;
      }
      
      if (taskError || !task) {
        return errorResult(`Task tidak ditemukan: ${taskError?.message}`);
      }
      
      const contact = task.contact?.[0] || task.contact;
      
      let detailText = `**${task.title}**\n\n`;
      if (task.description) detailText += `**Deskripsi:**\n${task.description}\n\n`;
      detailText += `**Status:** ${task.status}\n`;
      detailText += `**Prioritas:** ${task.priority}\n`;
      detailText += `**Assignee:** ${assignee ? `${assignee.first_name} ${assignee.last_name || ""}`.trim() : "Belum di-assign"}\n`;
      if (task.due_date) detailText += `**Due Date:** ${new Date(task.due_date).toLocaleDateString("id-ID")}\n`;
      if (contact) detailText += `**Kontak Terkait:** ${contact.first_name} ${contact.last_name || ""}\n`;
      
      return successResult(`Detail task: ${task.title}`, detailText, { task });
      
    } catch (error: any) {
      return errorResult(`Error: ${error.message}`);
    }
  },
};

// Tool: Get contact full profile
export const getContactFullProfileTool: Tool = {
  name: "get_contact_full_profile",
  description: "Mendapatkan profil lengkap kontak termasuk semua informasi (deals, tiket, catatan, task).",
  parameters: z.object({
    contact_name: z.string().optional().describe("Nama kontak yang dicari (contoh: 'Bu Yani')"),
    phone: z.string().optional().describe("Nomor telepon kontak lengkap (contoh: '628452318312')"),
  }),
  execute: async (args: { contact_name?: string; phone?: string }, context: ToolContext): Promise<ToolResult> => {
    try {
      const supabase = await createSupabaseServiceClient();
      
      // Get contact without FK joins to profiles
      let query = supabase
        .from("contacts")
        .select(`
          *,
          company:companies(id, name, industry)
        `)
        .eq("org_id", context.orgId);
      
      if (args.phone) {
        query = query.eq("phone", args.phone);
      } else if (args.contact_name) {
        query = query.or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`);
      } else {
        return errorResult("Harap berikan nama kontak atau nomor telepon");
      }
      
      const { data: contact, error: contactError } = await query.single();
      
      if (contactError || !contact) {
        return errorResult("Kontak tidak ditemukan");
      }
      
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      
      // Get owner separately
      const { data: owner } = contact.owner_id
        ? await supabase.from("profiles").select("first_name, last_name").eq("id", contact.owner_id).single()
        : { data: null };
      
      // Get all related data in parallel
      const [ticketsRes, dealsRes, notesRes, tasksRes] = await Promise.all([
        supabase.from("tickets").select("id, title, status, priority, created_at").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("deals").select("id, title, value, status, created_at").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("notes").select("id, content, created_at").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("tasks").select("id, title, status, priority, due_date").eq("contact_id", contact.id).order("due_date", { ascending: true }).limit(5),
      ]);
      
      const company = contact.company?.[0] || contact.company;
      
      let profileText = `**${fullName}**\n\n`;
      profileText += `**Status:** ${contact.status}\n`;
      profileText += `**Email:** ${contact.email || "-"}\n`;
      profileText += `**Phone:** ${contact.phone || "-"}\n`;
      profileText += `**Perusahaan:** ${company?.name || "-"}\n`;
      profileText += `**Owner:** ${owner ? `${owner.first_name} ${owner.last_name || ""}`.trim() : "-"}\n`;
      profileText += `**Lifetime Value:** Rp ${(contact.lifetime_value || 0).toLocaleString("id-ID")}\n\n`;
      
      profileText += `**Ringkasan:**\n`;
      profileText += `• Tiket: ${ticketsRes.data?.length || 0}\n`;
      profileText += `• Deals: ${dealsRes.data?.length || 0}\n`;
      profileText += `• Catatan: ${notesRes.data?.length || 0}\n`;
      profileText += `• Tasks: ${tasksRes.data?.length || 0}\n\n`;
      
      if (ticketsRes.data && ticketsRes.data.length > 0) {
        profileText += `**Tiket Terbaru:**\n`;
        ticketsRes.data.forEach((t: any) => {
          profileText += `• ${t.title} (${t.status})\n`;
        });
        profileText += `\n`;
      }
      
      if (dealsRes.data && dealsRes.data.length > 0) {
        profileText += `**Deals Terbaru:**\n`;
        dealsRes.data.forEach((d: any) => {
          profileText += `• ${d.title} - Rp ${(d.value || 0).toLocaleString("id-ID")}\n`;
        });
      }
      
      return successResult(`Profil lengkap: ${fullName}`, profileText, { 
        contact, 
        tickets: ticketsRes.data,
        deals: dealsRes.data,
        notes: notesRes.data,
        tasks: tasksRes.data
      });
      
    } catch (error: any) {
      return errorResult(`Error: ${error.message}`);
    }
  },
};

// Export all detail tools
export const detailTools = [
  getTicketDetailTool,
  getDealDetailTool,
  getNoteDetailTool,
  getTaskDetailTool,
  getContactFullProfileTool,
];
