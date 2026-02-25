import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = "https://rlcrvmkjvqrpwgzfcgky.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsY3J2bWtqdnFycHdnemZjZ2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgyMzgzNCwiZXhwIjoyMDg3Mzk5ODM0fQ.ux4HE2Hs0abFUVlb_TprdaGgjFfjqGgFjk6DFiZrEFM";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "public" },
});

// Step 1: Create an exec_sql function via the Supabase REST API
// We'll use the pg-meta endpoint if available, otherwise use rpc
async function createExecSqlFunction() {
  // Try calling the function first to see if it exists
  const { error } = await supabase.rpc("exec_sql", { sql_text: "SELECT 1" });
  if (!error) return true;

  // Function doesn't exist — we need to create it via another route
  console.log("exec_sql function not found, attempting to create via SQL...");
  return false;
}

// Alternative: Use the Supabase Studio's internal API endpoint
async function runSQLViaStudio(sqlContent) {
  // The Supabase pg-meta service runs at /pg/
  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/pg-meta/default/query`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sqlContent }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      continue;
    }
  }
  return null;
}

// Main approach: Split SQL into statements and use exec_sql RPC
// First we need to bootstrap exec_sql function
async function bootstrapExecSql() {
  // Create the function using Supabase's database webhook / edge function
  // Actually, let's check if we can use the pg REST API directly

  // Test if exec_sql exists
  const { data, error } = await supabase.rpc("exec_sql", {
    sql_text: "SELECT 1 as test",
  });

  if (!error) {
    console.log("exec_sql function already exists");
    return true;
  }

  console.log(
    "exec_sql not available. Trying alternative approaches...",
    error.message
  );
  return false;
}

async function main() {
  const hasExecSql = await bootstrapExecSql();

  if (hasExecSql) {
    // Run migrations through RPC
    const migrations = ["001_core_tables.sql", "002_wa_tables.sql"];

    for (const file of migrations) {
      const path = resolve("supabase/migrations", file);
      const content = readFileSync(path, "utf-8");
      console.log(`Running ${file}...`);
      try {
        const { data, error } = await supabase.rpc("exec_sql", {
          sql_text: content,
        });
        if (error) throw error;
        console.log(`  ✓ ${file} completed`);
      } catch (err) {
        console.error(`  ✗ ${file} failed:`, err.message);
      }
    }
  } else {
    // Try studio API
    console.log("Trying pg-meta API...");
    const result = await runSQLViaStudio("SELECT 1 as test");
    if (result) {
      console.log("pg-meta API works! Running migrations...");
      const migrations = ["001_core_tables.sql", "002_wa_tables.sql"];
      for (const file of migrations) {
        const path = resolve("supabase/migrations", file);
        const content = readFileSync(path, "utf-8");
        console.log(`Running ${file}...`);
        try {
          const result = await runSQLViaStudio(content);
          if (!result) throw new Error("No response from pg-meta");
          console.log(`  ✓ ${file} completed`);
        } catch (err) {
          console.error(`  ✗ ${file} failed:`, err.message);
        }
      }
    } else {
      console.log("\n❌ Cannot run migrations programmatically.");
      console.log("Your machine cannot reach the Supabase PostgreSQL server (IPv6-only).");
      console.log("Please run the migration SQL manually:");
      console.log("  1. Go to https://supabase.com/dashboard/project/rlcrvmkjvqrpwgzfcgky/sql");
      console.log("  2. Copy & paste the contents of supabase/migrations/001_core_tables.sql");
      console.log("  3. Click 'Run' ");
      console.log("  4. Repeat for supabase/migrations/002_wa_tables.sql");
    }
  }
}

main();
