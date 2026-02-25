import { useSyncExternalStore } from "react";

/**
 * All assignable menu hrefs (excluding Settings & Activity Log which are always visible).
 */
export const ASSIGNABLE_MENUS = [
  { href: "/messaging", label: "Messaging" },
  { href: "/products", label: "Products" },
  { href: "/contacts", label: "Contacts" },
  { href: "/companies", label: "Companies" },
  { href: "/tasks", label: "Tasks" },
  { href: "/tickets", label: "Tickets" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/deals", label: "Deals & Pipeline" },
  { href: "/segments", label: "Segmen Pelanggan" },
  { href: "/broadcast", label: "Broadcast" },
  { href: "/insights", label: "Customer Insight" },
] as const;

export type MenuHref = (typeof ASSIGNABLE_MENUS)[number]["href"];

const ALL_HREFS: MenuHref[] = ASSIGNABLE_MENUS.map((m) => m.href);

// --- Store ---
type AccessMap = Record<string, MenuHref[]>;
let accessMap: AccessMap = {};
let listeners: Array<() => void> = [];

function emitChange() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): AccessMap {
  return accessMap;
}

export function setMenuAccess(userId: string, menus: MenuHref[]) {
  accessMap = { ...accessMap, [userId]: menus };
  emitChange();
}

export function getUserMenus(userId: string): MenuHref[] {
  return accessMap[userId] ?? [...ALL_HREFS];
}

export function hasMenuAccess(userId: string, href: string): boolean {
  if (href.startsWith("/settings") || href.startsWith("/activity")) return true;
  const userMenus = accessMap[userId];
  if (!userMenus) return true;
  return userMenus.some((m) => href.startsWith(m));
}

/** React hook to reactively get a user's allowed menus */
export function useMenuAccess(userId: string): MenuHref[] {
  const map = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return map[userId] ?? [...ALL_HREFS];
}

/** React hook to reactively get the entire access map (for sidebar filtering) */
export function useMenuAccessMap(): AccessMap {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
