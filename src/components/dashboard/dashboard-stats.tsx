"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Handshake, Trophy, CheckSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import type { DashboardStats as DashboardStatsType } from "@/types";

const cardConfigs = [
  {
    key: "contacts",
    title: "Total Contacts",
    icon: Users,
    cardBg: "bg-accent-blue",
    cardText: "text-white",
    iconBg: "bg-white/20",
    href: "/contacts",
  },
  {
    key: "deals",
    title: "Open Deals Value",
    icon: Handshake,
    cardBg: "bg-accent-yellow",
    cardText: "text-accent-dark",
    iconBg: "bg-accent-dark/10",
    href: "/deals",
  },
  {
    key: "won",
    title: "Won Bulan Ini",
    icon: Trophy,
    cardBg: "bg-accent-teal",
    cardText: "text-white",
    iconBg: "bg-white/20",
    href: "/deals",
  },
  {
    key: "tasks",
    title: "Tasks Due Today",
    icon: CheckSquare,
    cardBg: "bg-accent-dark",
    cardText: "text-white",
    iconBg: "bg-white/15",
    href: "/tasks",
  },
];

function getStatValues(stats: DashboardStatsType | null) {
  if (!stats) {
    return {
      contacts: { value: formatNumber(0), change: "+0 bulan ini" },
      deals: { value: formatCurrency(0), change: "0 total deals" },
      won: { value: formatCurrency(0), change: "0 deals closed" },
      tasks: { value: formatNumber(0), change: "0 overdue" },
    };
  }
  return {
    contacts: {
      value: formatNumber(stats.totalContacts),
      change: `+${stats.newContactsThisMonth} bulan ini`,
    },
    deals: {
      value: formatCurrency(stats.openDealsValue),
      change: `${stats.totalDeals} total deals`,
    },
    won: {
      value: formatCurrency(stats.wonValue),
      change: `${stats.wonThisMonth} deals closed`,
    },
    tasks: {
      value: formatNumber(stats.tasksDueToday),
      change: `${stats.overdueTasks} overdue`,
    },
  };
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Gagal memuat statistik");
        const json = await res.json();
        setStats(json.data ?? json);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statValues = getStatValues(stats);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardConfigs.map((config) => {
        const sv = statValues[config.key as keyof typeof statValues];
        return (
          <Link key={config.title} href={config.href}>
            <Card className={`${config.cardBg} ${config.cardText} shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border-0`}>
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <CardTitle className={`text-sm font-medium ${config.cardText} opacity-80`}>
                  {config.title}
                </CardTitle>
                <div className={`rounded-xl p-2.5 ${config.iconBg}`}>
                  <config.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center h-[52px]">
                    <Loader2 className="h-5 w-5 animate-spin opacity-60" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold tracking-tight">{sv.value}</div>
                    <p className={`text-xs ${config.cardText} opacity-70 mt-1`}>
                      {sv.change}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
