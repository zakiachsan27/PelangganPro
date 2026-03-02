import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ActionContext {
  org_id: string;
  user_id: string;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

// Helper: Find contact by phone or name
async function findContact(
  supabase: any,
  org_id: string,
  identifier: { phone?: string; name?: string; email?: string }
): Promise<any | null> {
  let query = supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, email")
    .eq("org_id", org_id);

  if (identifier.phone) {
    query = query.eq("phone", identifier.phone);
  } else if (identifier.email) {
    query = query.eq("email", identifier.email);
  } else if (identifier.name) {
    // Search by name (first or last)
    query = query.or(`first_name.ilike.%${identifier.name}%,last_name.ilike.%${identifier.name}%`);
  }

  const { data, error } = await query.limit(1).single();
  
  if (error || !data) return null;
  return data;
}

// Helper: Find deal by name
async function findDeal(
  supabase: any,
  org_id: string,
  name: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from("deals")
    .select("id, name, value, stage_id")
    .eq("org_id", org_id)
    .ilike("name", `%${name}%`)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

// ACTION: Create Note
export async function createNote(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    // Find contact
    const contact = await findContact(supabase, context.org_id, {
      phone: entities.phone,
      name: entities.contact_name,
      email: entities.email,
    });

    if (!contact) {
      return {
        success: false,
        message: `Kontak dengan identifier tersebut tidak ditemukan.`,
      };
    }

    // Create note
    const { data, error } = await supabase
      .from("notes")
      .insert({
        org_id: context.org_id,
        contact_id: contact.id,
        content: entities.content || "",
        created_by: context.user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: `Catatan berhasil dibuat untuk ${contact.first_name} ${contact.last_name}.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal membuat catatan.",
    };
  }
}

// ACTION: Create Task
export async function createTask(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    let contact_id = null;
    
    // Find contact if provided
    if (entities.contact_name || entities.phone) {
      const contact = await findContact(supabase, context.org_id, {
        phone: entities.phone,
        name: entities.contact_name,
      });
      if (contact) contact_id = contact.id;
    }

    // Parse due date
    let due_date = entities.due_date;
    if (!due_date && entities.title) {
      // Try to extract date from title (e.g., "besok", "minggu depan")
      const lowerTitle = entities.title.toLowerCase();
      const today = new Date();
      
      if (lowerTitle.includes("besok")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        due_date = tomorrow.toISOString().split("T")[0];
      } else if (lowerTitle.includes("minggu depan")) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        due_date = nextWeek.toISOString().split("T")[0];
      } else {
        // Default: today
        due_date = today.toISOString().split("T")[0];
      }
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        org_id: context.org_id,
        title: entities.title || "Task",
        description: entities.content || "",
        due_date: due_date,
        priority: entities.priority || "medium",
        status: "todo",
        contact_id: contact_id,
        assigned_to: context.user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: `Reminder "${data.title}" berhasil dibuat${due_date ? ` untuk tanggal ${due_date}` : ""}.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal membuat reminder.",
    };
  }
}

// ACTION: Query Contact
export async function queryContact(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    const contact = await findContact(supabase, context.org_id, {
      phone: entities.phone,
      name: entities.contact_name,
      email: entities.email,
    });

    if (!contact) {
      return {
        success: true,
        message: `Kontak dengan identifier tersebut tidak ditemukan di database.`,
      };
    }

    // Get additional info
    const [{ data: notes }, { data: deals }, { data: tasks }] = await Promise.all([
      supabase.from("notes").select("content, created_at").eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("deals").select("name, value, status").eq("contact_id", contact.id).limit(3),
      supabase.from("tasks").select("title, due_date, status").eq("contact_id", contact.id).eq("status", "todo").limit(3),
    ]);

    let message = `**${contact.first_name} ${contact.last_name}**\n`;
    message += `📱 ${contact.phone || "-"}\n`;
    message += `📧 ${contact.email || "-"}\n\n`;
    
    if (deals?.length) {
      message += `💼 **Deals:** ${deals.length} aktif\n`;
    }
    if (tasks?.length) {
      message += `✅ **Tasks:** ${tasks.length} pending\n`;
    }
    if (notes?.length) {
      message += `📝 **Catatan terakhir:** ${notes[0].content.substring(0, 50)}${notes[0].content.length > 50 ? "..." : ""}\n`;
    }

    return {
      success: true,
      data: contact,
      message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal mencari kontak.",
    };
  }
}

// ACTION: Update Deal
export async function updateDeal(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    const deal = await findDeal(supabase, context.org_id, entities.deal_name);
    
    if (!deal) {
      return {
        success: false,
        message: `Deal dengan nama "${entities.deal_name}" tidak ditemukan.`,
      };
    }

    const updates: any = {};
    if (entities.stage) updates.stage_id = entities.stage;
    if (entities.value) updates.value = entities.value;

    const { data, error } = await supabase
      .from("deals")
      .update(updates)
      .eq("id", deal.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: `Deal "${deal.name}" berhasil diupdate.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal mengupdate deal.",
    };
  }
}

// ACTION: Count Entities
export async function countEntities(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    let count = 0;
    let message = "";

    switch (entities.entity_type) {
      case "contacts":
        const { count: contactCount } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("org_id", context.org_id);
        count = contactCount || 0;
        message = `Total kontak: **${count}**`;
        break;
        
      case "deals":
        let dealQuery = supabase
          .from("deals")
          .select("*", { count: "exact", head: true })
          .eq("org_id", context.org_id);
        
        if (entities.filter === "active") {
          // Exclude closed deals
          const { data: closedStages } = await supabase
            .from("pipeline_stages")
            .select("id")
            .eq("org_id", context.org_id)
            .or("is_won.eq.true,is_lost.eq.true");
          
          const closedIds = closedStages?.map((s: any) => s.id) || [];
          if (closedIds.length > 0) {
            dealQuery = dealQuery.not("stage_id", "in", `(${closedIds.join(",")})`);
          }
        }
        
        const { count: dealCount } = await dealQuery;
        count = dealCount || 0;
        message = `Total deals${entities.filter === "active" ? " aktif" : ""}: **${count}**`;
        break;
        
      case "tickets":
        const { count: ticketCount } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("org_id", context.org_id)
          .in("status", ["open", "in_progress"]);
        count = ticketCount || 0;
        message = `Total tickets open: **${count}**`;
        break;
        
      case "tasks":
        const today = new Date().toISOString().split("T")[0];
        const { count: taskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("org_id", context.org_id)
          .eq("due_date", today)
          .not("status", "in", "(done,cancelled)");
        count = taskCount || 0;
        message = `Tasks due today: **${count}**`;
        break;
        
      default:
        message = "Tipe entity tidak dikenali.";
    }

    return {
      success: true,
      data: { count },
      message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal menghitung data.",
    };
  }
}

// ACTION: Analyze Data (RFM, Pipeline)
export async function analyzeData(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    let message = "";

    if (entities.analysis_type === "rfm" || entities.query?.includes("sering")) {
      // Get top customers by lifetime_value
      const { data: topCustomers } = await supabase
        .from("contacts")
        .select("first_name, last_name, lifetime_value")
        .eq("org_id", context.org_id)
        .order("lifetime_value", { ascending: false })
        .limit(5);

      if (topCustomers?.length) {
        message = "**Top 5 Kontak (by Lifetime Value):**\n\n";
        topCustomers.forEach((c: any, i: number) => {
          message += `${i + 1}. ${c.first_name} ${c.last_name} - Rp ${c.lifetime_value?.toLocaleString("id-ID") || 0}\n`;
        });
      } else {
        message = "Belum ada data lifetime value.";
      }
    } else if (entities.analysis_type === "pipeline" || entities.query?.includes("pipeline")) {
      // Get pipeline summary
      const { data: stages } = await supabase
        .from("pipeline_stages")
        .select("id, name")
        .eq("org_id", context.org_id)
        .eq("is_won", false)
        .eq("is_lost", false);

      if (stages?.length) {
        const stageIds = stages.map((s: any) => s.id);
        const { data: deals } = await supabase
          .from("deals")
          .select("stage_id, value")
          .eq("org_id", context.org_id)
          .in("stage_id", stageIds);

        message = "**Pipeline Summary:**\n\n";
        let totalValue = 0;
        
        stages.forEach((stage: any) => {
          const stageDeals = deals?.filter((d: any) => d.stage_id === stage.id) || [];
          const stageValue = stageDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
          totalValue += stageValue;
          message += `• ${stage.name}: ${stageDeals.length} deals (Rp ${stageValue.toLocaleString("id-ID")})\n`;
        });
        
        message += `\n**Total Pipeline Value: Rp ${totalValue.toLocaleString("id-ID")}**`;
      } else {
        message = "Pipeline kosong.";
      }
    } else {
      message = "Analisis tidak dikenali. Coba: 'analisis RFM' atau 'pipeline summary'";
    }

    return {
      success: true,
      message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal menganalisis data.",
    };
  }
}

// ACTION: List Recent Activities
export async function listRecentActivities(
  entities: any,
  context: ActionContext
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  
  try {
    const { data: activities } = await supabase
      .from("activities")
      .select("action, entity_type, entity_title, created_at")
      .eq("org_id", context.org_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!activities?.length) {
      return {
        success: true,
        message: "Belum ada aktivitas recent.",
      };
    }

    let message = "**Aktivitas Terbaru:**\n\n";
    activities.forEach((a: any) => {
      const date = new Date(a.created_at).toLocaleDateString("id-ID");
      message += `• ${a.action} ${a.entity_type}: ${a.entity_title} (${date})\n`;
    });

    return {
      success: true,
      data: activities,
      message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Gagal mengambil aktivitas.",
    };
  }
}
