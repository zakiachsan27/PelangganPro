"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, Users, TrendingUp, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RfmBadge } from "./rfm-badge";
import type { RfmSegmentInfo, RfmSegment } from "@/types";
import { toast } from "sonner";

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

interface SegmentDetailHeaderProps {
  segment: RfmSegmentInfo;
}

export function SegmentDetailHeader({ segment }: SegmentDetailHeaderProps) {
  const [stats, setStats] = useState<{ count: number; totalRevenue: number; avgLtv: number }>({
    count: 0,
    totalRevenue: 0,
    avgLtv: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/segments/stats");
        if (!res.ok) throw new Error("Gagal memuat stats");
        const data: SegmentStat[] = await res.json();
        const match = data.find((s) => s.segment === segment.key);
        if (match) {
          setStats({ count: match.count, totalRevenue: match.totalRevenue, avgLtv: match.avgLtv });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat stats");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [segment.key]);

  const statItems = [
    { label: "Pelanggan", value: stats.count.toString(), icon: Users },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
    { label: "Avg. LTV", value: formatCurrency(stats.avgLtv), icon: ShoppingCart },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{segment.label}</h1>
            <RfmBadge segment={segment.key} />
          </div>
          <p className="text-sm text-muted-foreground">{segment.description}</p>
        </div>
        <Link href={`/broadcast?segment=${segment.key}`}>
          <Button>
            <Megaphone className="mr-2 h-4 w-4" />
            Broadcast ke Segmen
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {statItems.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
