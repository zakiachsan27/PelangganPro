import Link from "next/link";
import { ShoppingCart, Clock, Repeat, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfmBadge } from "@/components/segments/rfm-badge";
import type { ContactRfm } from "@/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";

interface ContactRfmCardProps {
  rfm: ContactRfm;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function ScoreIndicator({ label, value }: { label: string; value: number }) {
  const percentage = (value / 5) * 100;
  const color =
    value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-blue-500" : value >= 2 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold">{value}/5</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ContactRfmCard({ rfm }: ContactRfmCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">RFM Score</CardTitle>
          <Link href={`/segments/${rfm.segment}`}>
            <RfmBadge segment={rfm.segment} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScoreIndicator label="Recency" value={rfm.scores.recency} />
        <ScoreIndicator label="Frequency" value={rfm.scores.frequency} />
        <ScoreIndicator label="Monetary" value={rfm.scores.monetary} />

        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Purchases</p>
              <p className="text-sm font-semibold">{rfm.total_purchases}x</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-sm font-semibold">{formatCurrency(rfm.total_spent)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Order</p>
              <p className="text-sm font-semibold">{formatCurrency(rfm.avg_order_value)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Buy</p>
              <p className="text-sm font-semibold">
                {rfm.last_purchase_date ? formatRelativeTime(rfm.last_purchase_date) : "-"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
