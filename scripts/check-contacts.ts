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
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, whatsapp, org_id")
    .eq("org_id", "f741c3d7-2a10-4c0a-9b2b-f5030273df07");

  console.log("Contacts in Zaki's org:\n");
  contacts?.forEach((c: any) => {
    console.log(`${c.first_name} ${c.last_name || ""} (${c.id})`);
    console.log(`  phone: ${c.phone || "null"}`);
    console.log(`  whatsapp: ${c.whatsapp || "null"}`);
    console.log("");
  });
}

check();
