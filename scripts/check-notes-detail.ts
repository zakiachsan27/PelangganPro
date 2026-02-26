import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const [k, v] = line.split("=");
  if (k && v) process.env[k.trim()] = v.trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("=== ALL NOTES ===\n");
  
  const { data: notes } = await supabase
    .from("notes")
    .select("*, author:profiles(full_name)")
    .eq("org_id", "f741c3d7-2a10-4c0a-9b2b-f5030273df07");

  if (!notes || notes.length === 0) {
    console.log("No notes found");
    return;
  }

  for (const note of notes) {
    console.log(`Note: "${note.content}"`);
    console.log(`  ID: ${note.id}`);
    console.log(`  Contact ID: ${note.contact_id}`);
    console.log(`  Author: ${note.author?.full_name}`);
    console.log(`  Created: ${note.created_at}`);
    
    // Get contact details
    const { data: contact } = await supabase
      .from("contacts")
      .select("first_name, last_name, phone, whatsapp")
      .eq("id", note.contact_id)
      .single();
    
    if (contact) {
      console.log(`  Contact Name: ${contact.first_name} ${contact.last_name || ""}`);
      console.log(`  Contact Phone: ${contact.phone || "N/A"}`);
      console.log(`  Contact WhatsApp: ${contact.whatsapp || "N/A"}`);
    }
    console.log("");
  }
}

check();
