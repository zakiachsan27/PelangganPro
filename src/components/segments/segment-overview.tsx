"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Target, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentCard } from "./segment-card";
import { RFM_SEGMENTS } from "@/lib/rfm";
import { toast } from "sonner";
import type { RfmSegment } from "@/types";

interface SegmentStat {
  segment: RfmSegment;
  count: number;
  totalRevenue: number;
  avgLtv: number;
}

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

export function SegmentOverview() {
  const [segmentStats, setSegmentStats] = useState<SegmentStat[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, overviewRes] = await Promise.all([
          fetch("/api/segments/stats"),
          fetch("/api/insights/overview"),
        ]);
        if (!statsRes.ok || !overviewRes.ok) throw new Error("Gagal memuat data segmen");
        const stats: SegmentStat[] = await statsRes.json();
        const ov: OverviewData = await overviewRes.json();
        setSegmentStats(stats);
        setOverview(ov);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat data segmen");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const atRiskCount = segmentStats
    .filter((s) => s.segment === "at_risk" || s.segment === "hibernating" || s.segment === "lost")
    .reduce((sum, s) => sum + s.count, 0);

  const summaryCards = [
    { label: "Total Pelanggan", value: (overview?.totalCustomers ?? 0).toString(), icon: Users, color: "text-primary" },
    { label: "Total Revenue", value: formatCurrency(overview?.totalRevenue ?? 0), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Avg. LTV", value: formatCurrency(overview?.avgLtv ?? 0), icon: Target, color: "text-blue-500" },
    { label: "Perlu Perhatian", value: atRiskCount.toString(), icon: AlertTriangle, color: "text-orange-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {RFM_SEGMENTS.map((segment) => {
          const stats = segmentStats.find((s) => s.segment === segment.key);
          return (
            <SegmentCard
              key={segment.key}
              segment={segment}
              stats={{ count: stats?.count ?? 0, totalRevenue: stats?.totalRevenue ?? 0, avgLtv: stats?.avgLtv ?? 0 }}
            />
          );
        })}
      </div>
    </div>
  );
}
