"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RFM_SEGMENTS, RFM_SEGMENT_COLORS } from "@/lib/rfm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RfmSegment } from "@/types";

interface SegmentStat {
  segment: RfmSegment;
  count: number;
  totalRevenue: number;
  avgLtv: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function SegmentComparison() {
  const [segmentStats, setSegmentStats] = useState<SegmentStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/segments/stats");
        if (!res.ok) throw new Error("Gagal memuat data segmen");
        const data: SegmentStat[] = await res.json();
        setSegmentStats(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat data segmen");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const data = RFM_SEGMENTS.map((seg) => {
    const stats = segmentStats.find((s) => s.segment === seg.key);
    return {
      segment: seg,
      stats: { count: stats?.count ?? 0, totalRevenue: stats?.totalRevenue ?? 0, avgLtv: stats?.avgLtv ?? 0 },
      colors: RFM_SEGMENT_COLORS[seg.key],
    };
  });

  const maxCount = Math.max(1, ...data.map((d) => d.stats.count));
  const maxRevenue = Math.max(1, ...data.map((d) => d.stats.totalRevenue));
  const maxLtv = Math.max(1, ...data.map((d) => d.stats.avgLtv));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perbandingan Segmen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          data.map(({ segment, stats, colors }) => {
            const countW = (stats.count / maxCount) * 100;
            const revenueW = (stats.totalRevenue / maxRevenue) * 100;
            const ltvW = (stats.avgLtv / maxLtv) * 100;

            return (
              <div key={segment.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", colors.dot)} />
                    <span className="text-sm font-medium">{segment.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.count} pelanggan
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-14 text-right">Count</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors.dot)}
                        style={{ width: `${countW}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-14 text-right">Revenue</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all opacity-70", colors.dot)}
                        style={{ width: `${revenueW}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">
                      {formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-14 text-right">Avg LTV</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all opacity-50", colors.dot)}
                        style={{ width: `${ltvW}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">
                      {formatCurrency(stats.avgLtv)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
