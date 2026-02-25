"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyCompact } from "@/lib/format";
import { TrendingUp } from "lucide-react";

function getRecentMonths(): { month: string; revenue: number }[] {
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const now = new Date();
  const result: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: bulan[d.getMonth()], revenue: 0 });
  }
  return result;
}

export function RevenueChart() {
  const data = getRecentMonths();
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const hasData = totalRevenue > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue Trend</CardTitle>
          <span className="text-sm text-muted-foreground">
            Total: {formatCurrencyCompact(totalRevenue)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-2xl p-4">
          {hasData ? (
            <div className="flex items-end gap-3">
              {data.map((d) => {
                const maxRevenue = Math.max(...data.map((x) => x.revenue));
                const heightPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrencyCompact(d.revenue)}
                    </span>
                    <div className="relative w-full h-[140px]">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-primary hover:bg-primary/80 transition-colors min-h-[4px]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
              <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Belum ada data revenue</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
