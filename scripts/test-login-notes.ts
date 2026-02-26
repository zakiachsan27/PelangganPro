/**
 * Test login as Zaki and check if notes are visible
 * 
 * Jalankan: npx tsx scripts/test-login-notes.ts
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
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testLogin() {
  console.log("🔐 Testing login as Zaki...\n");

  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "zakiachsan28@gmail.com",
    password: "Zakiachsan123!",
  });

  if (authError) {
    console.error("❌ Login failed:", authError.message);
    return;
  }

  console.log("✅ Login successful!");
  console.log(`   User ID: ${authData.user.id}`);
  console.log(`   Email: ${authData.user.email}`);

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, full_name")
    .eq("id", authData.user.id)
    .single();

  console.log(`   Name: ${profile?.full_name}`);
  console.log(`   Org ID: ${profile?.org_id}\n`);

  // Get contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, org_id")
    .eq("org_id", profile?.org_id)
    .limit(5);

  console.log(`📇 Contacts in your org: ${contacts?.length || 0}`);
  
  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      console.log(`\n   Contact: ${contact.first_name} ${contact.last_name || ""}`.trim());
      console.log(`   ID: ${contact.id}`);
      console.log(`   Phone: ${contact.phone || "N/A"}`);

      // Get notes for this contact (via RLS - user's session)
      const { data: notes, error: notesError } = await supabase
        .from("notes")
        .select("*, author:profiles(full_name)")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false });

      if (notesError) {
        console.log(`   ❌ Error fetching notes: ${notesError.message}`);
      } else {
        console.log(`   📝 Notes: ${notes?.length || 0}`);
        if (notes && notes.length > 0) {
          notes.forEach((note, i) => {
            console.log(`      ${i + 1}. "${note.content.substring(0, 40)}..." by ${note.author?.full_name || "Unknown"}`);
          });
        }
      }
    }
  }

  // Get all notes for user's org
  console.log("\n\n📊 All notes in your org:");
  const { data: allNotes } = await supabase
    .from("notes")
    .select("id, content, contact_id, created_at")
    .eq("org_id", profile?.org_id);

  console.log(`   Total: ${allNotes?.length || 0}`);
  
  if (allNotes && allNotes.length > 0) {
    allNotes.forEach((note, i) => {
      console.log(`   ${i + 1}. ${note.content.substring(0, 50)}...`);
    });
  }

  // Logout
  await supabase.auth.signOut();
  console.log("\n✅ Test complete!");
}

testLogin().catch(console.error);
