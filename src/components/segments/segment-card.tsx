import Link from "next/link";
import { Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RfmBadge } from "./rfm-badge";
import type { RfmSegmentInfo } from "@/types";
import { cn } from "@/lib/utils";
import { RFM_SEGMENT_COLORS } from "@/lib/rfm";

interface SegmentCardStats {
  count: number;
  totalRevenue: number;
  avgLtv: number;
}

interface SegmentCardProps {
  segment: RfmSegmentInfo;
  stats: SegmentCardStats;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return `Rp ${value}`;
}

export function SegmentCard({ segment, stats }: SegmentCardProps) {
  const colors = RFM_SEGMENT_COLORS[segment.key];

  return (
    <Link href={`/segments/${segment.key}`}>
      <Card className="group hover:bg-muted/50 transition-colors duration-200 h-full">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <RfmBadge segment={segment.key} />
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {segment.description}
          </p>

          <div className="flex items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Users className={cn("h-3.5 w-3.5", colors.text)} />
              <span className="text-sm font-semibold">{stats.count}</span>
              <span className="text-xs text-muted-foreground">pelanggan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{formatCurrency(stats.totalRevenue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
