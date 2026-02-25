/**
 * Formatting utilities for Indonesian locale
 */

/**
 * Format number as IDR currency (e.g., "Rp 25.000.000")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number as compact IDR (e.g., "Rp 25 jt", "Rp 1,2 M")
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".0", "")} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} rb`;
  }
  return `Rp ${value}`;
}

/**
 * Format date as Indonesian locale (e.g., "22 Feb 2026")
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Format date as relative time (e.g., "2 hari lalu", "baru saja")
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return formatDate(dateStr);
}

/**
 * Format phone number for display (e.g., "+62 812-3456-7890")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("62") && cleaned.length >= 11) {
    const rest = cleaned.slice(2);
    return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length >= 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  // Other numbers — just add + prefix, no fake country code parsing
  if (cleaned.length >= 10) {
    return `+${cleaned}`;
  }
  return phone;
}

/**
 * Extract and format phone number from a WhatsApp JID or raw name.
 * Falls back to the name if it doesn't look like a phone number.
 */
export function formatWaName(
  remoteName: string,
  remoteJid: string,
  phoneNumber?: string | null
): string {
  // If remote_name is a saved contact name (not just digits), use it
  const isJustDigits = /^\d+$/.test(remoteName);
  if (!isJustDigits && remoteName) return remoteName;

  // If we have a resolved phone number (from LID→phone mapping), format it
  if (phoneNumber && /^\d+$/.test(phoneNumber)) {
    return formatPhone(phoneNumber);
  }

  // Parse JID type
  const [localPart, domain] = remoteJid.split("@");

  // Individual chats — the local part IS the phone number
  // @s.whatsapp.net = Baileys format, @c.us = WAHA format
  if ((domain === "s.whatsapp.net" || domain === "c.us") && localPart && /^\d+$/.test(localPart)) {
    return formatPhone(localPart);
  }

  // Group chats
  if (domain === "g.us") {
    return remoteName || "Grup";
  }

  // Newsletter / channel
  if (domain === "newsletter") {
    return remoteName || "Channel";
  }

  // LID or other unknown types — show "Kontak" instead of raw LID number
  if (domain === "lid") {
    return "Kontak";
  }

  if (remoteName) return remoteName;
  return localPart || "Unknown";
}

/**
 * Format number with Indonesian thousand separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Get initials from a full name (e.g., "Budi Santoso" → "BS")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
