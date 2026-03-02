/**
 * Super Simple Agent - No Complexity
 * 
 * Flow: User ask → Match tool → Execute → Answer
 * No loops, no chains, max 1 tool call per question
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Tool registry sederhana
const tools: Record<string, Function> = {
  get_contact_tickets: async (args: any, context: any) => {
    const supabase = await createSupabaseServerClient();
    
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("org_id", context.orgId)
      .or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`)
      .limit(1);
    
    if (!contacts?.length) return { error: `Kontak "${args.contact_name}" tidak ditemukan` };
    
    const contact = contacts[0];
    const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
    
    const { data: tickets } = await supabase
      .from("tickets")
      .select("title, description, status, priority")
      .eq("org_id", context.orgId)
      .eq("contact_id", contact.id);
    
    if (!tickets?.length) return { answer: `${fullName} tidak memiliki tiket.` };
    
    const list = tickets.map((t, i) => 
      `${i + 1}. **${t.title}**\n   Status: ${t.status}\n   ${t.description || ""}`
    ).join("\n\n");
    
    return { answer: `**Tiket ${fullName} (${tickets.length} tiket):**\n\n${list}` };
  },
  
  get_contact_notes: async (args: any, context: any) => {
    const supabase = await createSupabaseServerClient();
    
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("org_id", context.orgId)
      .or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`)
      .limit(1);
    
    if (!contacts?.length) return { error: `Kontak "${args.contact_name}" tidak ditemukan` };
    
    const contact = contacts[0];
    const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
    
    const { data: notes } = await supabase
      .from("notes")
      .select("content, created_at")
      .eq("org_id", context.orgId)
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });
    
    if (!notes?.length) return { answer: `${fullName} tidak memiliki catatan.` };
    
    const list = notes.map((n, i) => 
      `${i + 1}. ${new Date(n.created_at).toLocaleDateString("id-ID")}: ${n.content.substring(0, 100)}${n.content.length > 100 ? "..." : ""}`
    ).join("\n");
    
    return { answer: `**Catatan ${fullName} (${notes.length} catatan):**\n\n${list}` };
  },
  
  count_entities: async (args: any, context: any) => {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from(args.entity_type)
      .select("*", { count: "exact", head: true })
      .eq("org_id", context.orgId);
    
    return { answer: `Total ${args.entity_type} di sistem: ${count || 0}` };
  },
  
  get_contact_tasks: async (args: any, context: any) => {
    const supabase = await createSupabaseServerClient();
    
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("org_id", context.orgId)
      .or(`first_name.ilike.%${args.contact_name}%,last_name.ilike.%${args.contact_name}%`)
      .limit(1);
    
    if (!contacts?.length) return { error: `Kontak "${args.contact_name}" tidak ditemukan` };
    
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, description, status, priority, due_date")
      .eq("org_id", context.orgId)
      .eq("contact_id", contacts[0].id);
    
    if (!tasks?.length) return { answer: `${contacts[0].first_name} tidak memiliki task.` };
    
    const list = tasks.map((t, i) => 
      `${i + 1}. **${t.title}** (${t.status})\n   ${t.description || ""}`
    ).join("\n\n");
    
    return { answer: `**Task ${contacts[0].first_name} (${tasks.length} task):**\n\n${list}` };
  },
};

// Simple intent matching - IMPROVED
function matchTool(message: string): { tool: string; args: any } | null {
  const lower = message.toLowerCase();
  
  // Extract name from message
  const names = ["bu yani", "miss bella", "pak juli", "pak edi", "budi"];
  let foundName = null;
  for (const name of names) {
    if (lower.includes(name)) {
      foundName = name.replace(/\b\w/g, (l) => l.toUpperCase());
      break;
    }
  }
  
  // If asking about specific person's tickets
  if (lower.includes("tiket") && foundName) {
    return { tool: "get_contact_tickets", args: { contact_name: foundName } };
  }
  
  // If asking about specific person's notes
  if ((lower.includes("catatan") || lower.includes("note")) && foundName) {
    return { tool: "get_contact_notes", args: { contact_name: foundName } };
  }
  
  // If asking about specific person's tasks
  if ((lower.includes("task") || lower.includes("tugas")) && foundName) {
    return { tool: "get_contact_tasks", args: { contact_name: foundName } };
  }
  
  // General count (no specific name)
  if (lower.includes("berapa") && lower.includes("tiket") && !foundName) {
    return { tool: "count_entities", args: { entity_type: "tickets" } };
  }
  if (lower.includes("berapa") && lower.includes("kontak") && !foundName) {
    return { tool: "count_entities", args: { entity_type: "contacts" } };
  }
  
  return null;
}

export async function processSimpleMessage(
  message: string,
  context: { orgId: string; userId: string; sessionId: string }
): Promise<string> {
  console.log(`[SimpleAgent] Processing: "${message}"`);
  
  const match = matchTool(message);
  
  if (!match) {
    return "Maaf, saya tidak mengerti. Coba tanya: 'berapa tiket' atau 'tiket Bu Yani'";
  }
  
  const toolFn = tools[match.tool];
  if (!toolFn) {
    return "Maaf, fitur belum tersedia.";
  }
  
  try {
    const result = await toolFn(match.args, context);
    return result.answer || result.error || "Tidak ada data.";
  } catch (error: any) {
    console.error("[SimpleAgent] Error:", error);
    return "Maaf, terjadi kesalahan. Silakan coba lagi.";
  }
}
