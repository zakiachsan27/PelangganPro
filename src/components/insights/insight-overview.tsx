"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, TrendingDown, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface OverviewData {
  totalCustomers: number;
  totalRevenue: number;
  avgLtv: number;
  churnRate: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function InsightOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/insights/overview");
        if (!res.ok) throw new Error("Gagal memuat overview");
        const json: OverviewData = await res.json();
        setData(json);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat overview");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalCustomers = data?.totalCustomers ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const avgLtv = data?.avgLtv ?? 0;
  const churnRate = data?.churnRate ?? 0;

  const stats = [
    { label: "Total Customers", value: totalCustomers.toString(), change: "+3 bulan ini", icon: Users, color: "text-primary", changePositive: true },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "+12% MoM", icon: TrendingUp, color: "text-emerald-500", changePositive: true },
    { label: "Avg. LTV", value: formatCurrency(avgLtv), change: "+5% MoM", icon: BarChart3, color: "text-blue-500", changePositive: true },
    { label: "Churn Rate", value: `${churnRate}%`, change: "-2% MoM", icon: TrendingDown, color: "text-orange-500", changePositive: false },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className={`text-xs ${stat.changePositive ? "text-emerald-600" : "text-orange-600"}`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
