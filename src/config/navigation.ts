import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  Boxes,
  CheckSquare,
  UserPlus,
  Settings,
  Activity,
  PieChart,
  Megaphone,
  TrendingUp,
  TicketCheck,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string | null;
  items: NavItem[];
}

export const sidebarSections: NavSection[] = [
  {
    label: null,
    items: [
      { title: "Products", href: "/products", icon: Boxes },
      { title: "Contacts", href: "/contacts", icon: Users },
      { title: "Companies", href: "/companies", icon: Building2 },
      { title: "Tasks", href: "/tasks", icon: CheckSquare },
      { title: "Tickets", href: "/tickets", icon: TicketCheck },
    ],
  },
  {
    label: "Penjualan",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Leads", href: "/leads", icon: UserPlus },
      { title: "Deals & Pipeline", href: "/deals", icon: Handshake },
    ],
  },
  {
    label: "Retensi",
    items: [
      { title: "Segmen Pelanggan", href: "/segments", icon: PieChart },
      { title: "Broadcast", href: "/broadcast", icon: Megaphone },
      { title: "Customer Insight", href: "/insights", icon: TrendingUp },
    ],
  },
];

export const bottomNav: NavItem[] = [
  { title: "Activity Log", href: "/activity", icon: Activity },
  { title: "Settings", href: "/settings", icon: Settings },
];
