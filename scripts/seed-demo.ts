/**
 * Seed script: Buat akun demo + populate data untuk presentasi ke calon client
 *
 * Jalankan: npx tsx scripts/seed-demo.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
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

// ── Config ──────────────────────────────────────────────────
const DEMO_EMAIL = "demo@pelangganpro.id";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Andi Pratama";
const ORG_NAME = "PT Maju Bersama Digital";
const ORG_SLUG = "maju-bersama";

// ── Helpers ─────────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID();
}

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function jid(phone: string) {
  return `${phone}@s.whatsapp.net`;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log("🔧 Membuat akun demo...\n");

  // 1. Create org
  const orgId = uuid();
  const { error: orgErr } = await supabase.from("organizations").insert({
    id: orgId,
    name: ORG_NAME,
    slug: ORG_SLUG,
    plan_tier: "pro",
    settings: {
      currency: "IDR",
      timezone: "Asia/Jakarta",
    },
  });
  if (orgErr) {
    if (orgErr.code === "23505") {
      console.log("⚠️  Org sudah ada, skip...");
    } else {
      throw orgErr;
    }
  } else {
    console.log(`✅ Org "${ORG_NAME}" created (${orgId})`);
  }

  // Get actual org id (in case it already existed)
  const { data: orgRow } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", ORG_SLUG)
    .single();
  const actualOrgId = orgRow?.id || orgId;

  // 2. Create user via Auth Admin
  const { data: authData, error: authErr } =
    await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_NAME,
        org_id: actualOrgId,
        role: "owner",
      },
    });
  if (authErr) {
    if (authErr.message?.includes("already been registered")) {
      console.log("⚠️  User sudah ada, skip...");
    } else {
      throw authErr;
    }
  } else {
    console.log(`✅ User "${DEMO_EMAIL}" created (${authData.user.id})`);
  }

  // Get user id
  const { data: userList } = await supabase.auth.admin.listUsers();
  const demoUser = userList?.users?.find((u) => u.email === DEMO_EMAIL);
  if (!demoUser) throw new Error("Demo user not found after creation");
  const userId = demoUser.id;

  // 3. Create additional team members (profiles only — no auth)
  const agent1Id = uuid();
  const agent2Id = uuid();

  // We'll insert agents as auth users too so profiles trigger fires
  for (const agent of [
    { id: agent1Id, name: "Siti Rahayu", email: "siti@pelangganpro.id", role: "agent" },
    { id: agent2Id, name: "Budi Santoso", email: "budi@pelangganpro.id", role: "agent" },
  ]) {
    const { error } = await supabase.auth.admin.createUser({
      email: agent.email,
      password: "agent1234",
      email_confirm: true,
      user_metadata: {
        full_name: agent.name,
        org_id: actualOrgId,
        role: agent.role,
      },
    });
    if (error && !error.message?.includes("already been registered")) {
      console.warn(`⚠️  Agent ${agent.email}: ${error.message}`);
    } else {
      console.log(`✅ Agent "${agent.name}" created`);
    }
  }

  // Fetch actual agent IDs from profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("org_id", actualOrgId);

  const agentSiti = profiles?.find((p) => p.email === "siti@pelangganpro.id");
  const agentBudi = profiles?.find((p) => p.email === "budi@pelangganpro.id");

  // 4. Create WA Session (connected)
  const sessionId = uuid();
  await supabase.from("wa_sessions").insert({
    id: sessionId,
    org_id: actualOrgId,
    provider: "bailey",
    label: "WA Business Utama",
    phone_number: "+6281234567890",
    status: "connected",
    connected_at: ago(120),
    created_by: userId,
  });
  console.log(`✅ WA Session created (connected)`);

  // 5. Create conversations + messages
  const conversations = [
    {
      id: uuid(),
      remote_jid: jid("6281399001122"),
      remote_name: "Ibu Dewi Kartika",
      status: "open" as const,
      assigned_to: agentSiti?.id || null,
      contact_id: null,
      unread: 2,
      lastMsgMinAgo: 3,
      messages: [
        { dir: "inbound", body: "Halo, saya mau tanya soal paket CRM Pro ya", min: 45 },
        { dir: "outbound", body: "Halo Ibu Dewi! Terima kasih sudah menghubungi kami 🙏\nPaket CRM Pro kami mulai dari Rp 499.000/bulan untuk 5 user.", min: 43, sender: "siti" },
        { dir: "inbound", body: "Itu sudah termasuk WhatsApp integration?", min: 40 },
        { dir: "outbound", body: "Betul Bu, sudah termasuk:\n- WhatsApp multi-agent\n- Pipeline management\n- Laporan & analytics\n- Support prioritas", min: 38, sender: "siti" },
        { dir: "inbound", body: "Kalau untuk 10 user kena berapa?", min: 30 },
        { dir: "outbound", body: "Untuk 10 user Rp 899.000/bulan Bu. Atau bisa ambil paket tahunan dapat diskon 20%.", min: 28, sender: "siti" },
        { dir: "inbound", body: "Ok saya diskusi dulu sama tim ya", min: 15 },
        { dir: "inbound", body: "Nanti bisa demo gak?", min: 3 },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6285678901234"),
      remote_name: "Pak Hendra Wijaya",
      status: "open" as const,
      assigned_to: userId,
      contact_id: null,
      unread: 0,
      lastMsgMinAgo: 12,
      messages: [
        { dir: "inbound", body: "Pak, invoice bulan ini sudah keluar belum?", min: 60 },
        { dir: "outbound", body: "Sudah Pak Hendra, saya kirimkan ya lewat email.", min: 55, sender: "owner" },
        { dir: "inbound", body: "Ok ditunggu. Sekalian saya mau upgrade ke paket Enterprise", min: 50 },
        { dir: "outbound", body: "Baik Pak! Untuk upgrade Enterprise fitur tambahan:\n- Unlimited user\n- Custom workflow\n- Dedicated account manager\n- SLA 99.9%\n\nHarga Rp 2.499.000/bulan. Mau saya buatkan proposal?", min: 45, sender: "owner" },
        { dir: "inbound", body: "Boleh, kirim proposalnya", min: 40 },
        { dir: "outbound", body: "Siap Pak, proposal akan saya kirim hari ini via email 👍", min: 12, sender: "owner" },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6287712345678"),
      remote_name: "Linda Susanti",
      status: "open" as const,
      assigned_to: agentBudi?.id || null,
      contact_id: null,
      unread: 1,
      lastMsgMinAgo: 8,
      messages: [
        { dir: "inbound", body: "Halo min, kok saya ga bisa login ya?", min: 35 },
        { dir: "outbound", body: "Halo Kak Linda, bisa coba reset password di halaman login ya.\nKlik 'Lupa Password' lalu cek email.", min: 32, sender: "budi" },
        { dir: "inbound", body: "Sudah tapi emailnya ga masuk 😢", min: 25 },
        { dir: "outbound", body: "Coba cek folder spam/junk ya Kak. Kalau tetap tidak ada, saya bantu reset manual.", min: 22, sender: "budi" },
        { dir: "inbound", body: "Oh iya ada di spam! Makasih ya", min: 20 },
        { dir: "outbound", body: "Sama-sama Kak! Kalau ada kendala lain silakan hubungi kami 🙏", min: 18, sender: "budi" },
        { dir: "inbound", body: "Btw ada fitur export data ke Excel gak?", min: 8 },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6289988776655"),
      remote_name: "PT Cahaya Mandiri",
      status: "open" as const,
      assigned_to: null,
      contact_id: null,
      unread: 3,
      lastMsgMinAgo: 5,
      messages: [
        { dir: "inbound", body: "Selamat siang, kami dari PT Cahaya Mandiri", min: 20 },
        { dir: "inbound", body: "Kami tertarik dengan produk CRM kalian untuk 50 orang sales team kami", min: 18 },
        { dir: "inbound", body: "Bisa jadwalkan meeting online untuk demo?", min: 5 },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6281234509876"),
      remote_name: "Rizky Firmansyah",
      status: "resolved" as const,
      assigned_to: agentSiti?.id || null,
      contact_id: null,
      unread: 0,
      lastMsgMinAgo: 180,
      messages: [
        { dir: "inbound", body: "Min, cara import kontak dari CSV gimana ya?", min: 300 },
        { dir: "outbound", body: "Halo Kak Rizky! Caranya:\n1. Buka menu Contacts\n2. Klik tombol Import (icon upload)\n3. Pilih file CSV\n4. Mapping kolom sesuai field\n5. Klik Import\n\nFormat CSV: nama, email, telepon, perusahaan", min: 295, sender: "siti" },
        { dir: "inbound", body: "Mantap berhasil! Import 500 kontak lancar. Makasih banyak 🎉", min: 280 },
        { dir: "outbound", body: "Alhamdulillah! Senang bisa membantu 😊", min: 275, sender: "siti" },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6282233445566"),
      remote_name: "Anisa Putri",
      status: "resolved" as const,
      assigned_to: agentBudi?.id || null,
      contact_id: null,
      unread: 0,
      lastMsgMinAgo: 420,
      messages: [
        { dir: "inbound", body: "Hai, apakah PelangganPro bisa integrasi dengan Tokopedia?", min: 500 },
        { dir: "outbound", body: "Halo Kak Anisa! Saat ini kami belum support integrasi langsung dengan Tokopedia.\n\nNamun kami punya API & Webhook yang bisa digunakan untuk koneksi custom.\n\nApakah tim Kakak punya developer yang bisa bantu integrasi?", min: 495, sender: "budi" },
        { dir: "inbound", body: "Hmm sayangnya belum punya dev. Kalau nanti sudah ada integrasi resmi tolong kabari ya", min: 490 },
        { dir: "outbound", body: "Baik Kak, sudah kami catat sebagai feature request. Nanti kami kabari begitu sudah ready 🙏", min: 485, sender: "budi" },
        { dir: "inbound", body: "Siap, terima kasih infonya", min: 420 },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6283344556677"),
      remote_name: "Toko Makmur Jaya",
      status: "open" as const,
      assigned_to: userId,
      contact_id: null,
      unread: 0,
      lastMsgMinAgo: 25,
      messages: [
        { dir: "inbound", body: "Pak, kami mau perpanjang langganan untuk tahun depan", min: 90 },
        { dir: "outbound", body: "Baik Pak! Langganan saat ini paket Pro (5 user) ya?", min: 85, sender: "owner" },
        { dir: "inbound", body: "Iya betul. Tapi mau nambah jadi 8 user", min: 80 },
        { dir: "outbound", body: "Noted Pak. Untuk 8 user paket Pro: Rp 699.000/bulan.\nKalau ambil tahunan jadi Rp 6.710.000/tahun (hemat 20%).\n\nMau yang bulanan atau tahunan?", min: 75, sender: "owner" },
        { dir: "inbound", body: "Tahunan aja biar lebih hemat", min: 60 },
        { dir: "outbound", body: "Baik Pak, saya buatkan invoice Rp 6.710.000 untuk 12 bulan ya. Transfer ke BCA 1234567890 a/n PT Maju Bersama Digital.", min: 50, sender: "owner" },
        { dir: "inbound", body: "Oke, nanti sore saya transfer", min: 40 },
        { dir: "outbound", body: "Terima kasih banyak Pak! 🙏 Setelah transfer konfirmasi ke sini ya, nanti langsung kami aktifkan.", min: 25, sender: "owner" },
      ],
    },
    {
      id: uuid(),
      remote_jid: jid("6281122334455"),
      remote_name: "Dian Perkasa",
      status: "pending" as const,
      assigned_to: null,
      contact_id: null,
      unread: 1,
      lastMsgMinAgo: 95,
      messages: [
        { dir: "inbound", body: "Halo, saya baru daftar trial. Bisa minta panduan awal?", min: 130 },
        { dir: "outbound", body: "Halo Pak Dian! Selamat datang di PelangganPro CRM 🎉\n\nPanduan singkat:\n1. Tambahkan kontak pertama Anda\n2. Buat pipeline deals\n3. Hubungkan WhatsApp\n4. Undang tim Anda\n\nKami juga ada video tutorial di Help Center.", min: 125, sender: "siti" },
        { dir: "inbound", body: "Nanti sore free gak buat call? Saya mau tanya lebih detail", min: 95 },
      ],
    },
  ];

  for (const conv of conversations) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    await supabase.from("wa_conversations").insert({
      id: conv.id,
      org_id: actualOrgId,
      session_id: sessionId,
      contact_id: conv.contact_id,
      remote_jid: conv.remote_jid,
      remote_name: conv.remote_name,
      status: conv.status,
      assigned_to: conv.assigned_to,
      last_message_preview: lastMsg.body.substring(0, 100),
      last_message_at: ago(conv.lastMsgMinAgo),
      unread_count: conv.unread,
      provider: "bailey",
    });

    const msgRows = conv.messages.map((m) => ({
      id: uuid(),
      conversation_id: conv.id,
      wa_message_id: `demo_${uuid().substring(0, 8)}`,
      direction: m.dir,
      type: "text",
      body: m.body,
      status: m.dir === "outbound" ? "read" : "delivered",
      sender_name:
        m.dir === "inbound"
          ? conv.remote_name
          : (m as any).sender === "siti"
            ? "Siti Rahayu"
            : (m as any).sender === "budi"
              ? "Budi Santoso"
              : DEMO_NAME,
      sender_id:
        m.dir === "outbound"
          ? (m as any).sender === "siti"
            ? agentSiti?.id || null
            : (m as any).sender === "budi"
              ? agentBudi?.id || null
              : userId
          : null,
      created_at: ago(m.min),
    }));

    await supabase.from("wa_messages").insert(msgRows);
    console.log(`✅ Conversation "${conv.remote_name}" — ${msgRows.length} messages`);
  }

  // 6. Quick Replies
  const quickReplies = [
    { title: "Salam Pembuka", body: "Halo! Terima kasih sudah menghubungi PT Maju Bersama Digital. Ada yang bisa kami bantu? 🙏", category: "Greeting" },
    { title: "Salam Penutup", body: "Terima kasih atas waktunya. Jika ada pertanyaan lain, jangan ragu untuk menghubungi kami kembali. Selamat beraktivitas! 😊", category: "Greeting" },
    { title: "Minta Tunggu", body: "Mohon menunggu sebentar ya, kami sedang cek datanya terlebih dahulu.", category: "Greeting" },
    { title: "Info Harga Pro", body: "Paket CRM Pro:\n- 5 user: Rp 499.000/bln\n- 10 user: Rp 899.000/bln\n- 15 user: Rp 1.199.000/bln\n\nSudah termasuk WhatsApp integration, pipeline, dan laporan.", category: "Sales" },
    { title: "Info Harga Enterprise", body: "Paket Enterprise:\n- Unlimited user\n- Custom workflow & automation\n- Dedicated account manager\n- SLA 99.9%\n- Mulai Rp 2.499.000/bln\n\nMau kami kirimkan proposal lengkapnya?", category: "Sales" },
    { title: "Info Trial", body: "Kami menyediakan free trial 14 hari untuk semua fitur Pro. Silakan daftar di https://pelangganpro.id/register dan langsung bisa digunakan tanpa kartu kredit.", category: "Sales" },
    { title: "Jadwal Demo", body: "Kami bisa jadwalkan demo online via Google Meet. Tersedia slot:\n- Senin-Jumat: 10.00 & 14.00 WIB\n- Durasi: 30-45 menit\n\nMau pilih jadwal yang mana?", category: "Sales" },
    { title: "Reset Password", body: "Untuk reset password:\n1. Buka halaman login\n2. Klik 'Lupa Password'\n3. Masukkan email terdaftar\n4. Cek inbox email (termasuk folder spam)\n5. Klik link reset dan buat password baru", category: "Support" },
    { title: "Cara Import CSV", body: "Untuk import data via CSV:\n1. Buka menu Contacts/Deals\n2. Klik tombol Import\n3. Upload file CSV\n4. Mapping kolom sesuai field\n5. Klik Import\n\nTemplate CSV bisa didownload di halaman import.", category: "Support" },
    { title: "Jam Operasional", body: "Jam operasional customer support:\n- Senin-Jumat: 08.00 - 17.00 WIB\n- Sabtu: 09.00 - 13.00 WIB\n- Minggu & Hari Libur: Tutup\n\nDi luar jam kerja, silakan tinggalkan pesan dan kami akan balas di hari kerja berikutnya.", category: "Support" },
  ];

  for (const qr of quickReplies) {
    await supabase.from("wa_quick_replies").insert({
      id: uuid(),
      org_id: actualOrgId,
      title: qr.title,
      body: qr.body,
      category: qr.category,
      created_by: userId,
    });
  }
  console.log(`✅ ${quickReplies.length} Quick Replies created`);

  // Done!
  console.log("\n════════════════════════════════════════");
  console.log("  AKUN DEMO SIAP!");
  console.log("════════════════════════════════════════");
  console.log(`  Email    : ${DEMO_EMAIL}`);
  console.log(`  Password : ${DEMO_PASSWORD}`);
  console.log(`  Org      : ${ORG_NAME}`);
  console.log(`  Sessions : 1 (connected)`);
  console.log(`  Conversations : ${conversations.length}`);
  console.log(`  Quick Replies : ${quickReplies.length}`);
  console.log("════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
