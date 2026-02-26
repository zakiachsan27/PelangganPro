/**
 * Diagnose script untuk cek masalah notes tidak muncul di dashboard
 * 
 * Jalankan: npx tsx scripts/diagnose-notes.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function diagnose() {
  console.log("🔍 Diagnosing notes issue...\n");

  // 1. Get all notes
  const { data: allNotes, error: notesError } = await supabase
    .from("notes")
    .select("*, author:profiles(full_name, email)");

  if (notesError) {
    console.error("❌ Error fetching notes:", notesError);
    return;
  }

  console.log(`📊 Total notes in database: ${allNotes?.length || 0}\n`);

  if (!allNotes || allNotes.length === 0) {
    console.log("⚠️  No notes found in database");
    return;
  }

  // 2. Show all notes details
  console.log("📝 All notes:");
  console.log("=".repeat(80));
  for (const note of allNotes) {
    console.log(`\nNote ID: ${note.id}`);
    console.log(`  Content: ${note.content.substring(0, 50)}...`);
    console.log(`  org_id: ${note.org_id}`);
    console.log(`  contact_id: ${note.contact_id}`);
    console.log(`  author_id: ${note.author_id}`);
    console.log(`  Created: ${note.created_at}`);
    
    // Get contact details
    if (note.contact_id) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("first_name, last_name, org_id, phone")
        .eq("id", note.contact_id)
        .single();
      
      if (contact) {
        console.log(`  Contact: ${contact.first_name} ${contact.last_name || ""}`.trim());
        console.log(`  Contact org_id: ${contact.org_id}`);
        console.log(`  Contact phone: ${contact.phone}`);
        
        if (note.org_id !== contact.org_id) {
          console.log(`  ⚠️  MISMATCH! Note org_id != Contact org_id`);
        }
      }
    }
  }

  // 3. Get all users/profiles
  console.log("\n\n👥 All users/profiles:");
  console.log("=".repeat(80));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, org_id, role");

  if (profiles) {
    for (const profile of profiles) {
      console.log(`\n${profile.email}:`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Name: ${profile.full_name}`);
      console.log(`  org_id: ${profile.org_id}`);
      console.log(`  role: ${profile.role}`);
    }
  }

  // 4. Get all organizations
  console.log("\n\n🏢 All organizations:");
  console.log("=".repeat(80));
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug");

  if (orgs) {
    for (const org of orgs) {
      console.log(`\n${org.name} (${org.slug}):`);
      console.log(`  ID: ${org.id}`);
    }
  }

  // 5. Check RLS context simulation
  console.log("\n\n🔐 RLS Policy Check:");
  console.log("=".repeat(80));
  
  for (const profile of (profiles || [])) {
    // Simulate what get_my_org_id() would return for this user
    const userOrgId = profile.org_id;
    
    // Count notes visible to this user via RLS
    const visibleNotes = allNotes.filter(n => n.org_id === userOrgId);
    
    console.log(`\n${profile.email} (org: ${userOrgId}):`);
    console.log(`  Notes visible via RLS: ${visibleNotes.length}`);
    
    if (visibleNotes.length > 0) {
      visibleNotes.forEach(n => {
        console.log(`    - ${n.content.substring(0, 30)}...`);
      });
    }
  }

  console.log("\n\n✅ Diagnosis complete!");
}

diagnose().catch(console.error);
