"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trendData = [
  { month: "Sep", new: 3, churned: 0 },
  { month: "Okt", new: 4, churned: 1 },
  { month: "Nov", new: 2, churned: 0 },
  { month: "Des", new: 3, churned: 1 },
  { month: "Jan", new: 5, churned: 0 },
  { month: "Feb", new: 3, churned: 1 },
];

export function CustomerTrend() {
  const maxVal = Math.max(...trendData.flatMap((d) => [d.new, d.churned]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Customer Trend</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">New</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-destructive/70" />
              <span className="text-xs text-muted-foreground">Churned</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          {trendData.map((d) => {
            const newH = maxVal > 0 ? (d.new / maxVal) * 100 : 0;
            const churnH = maxVal > 0 ? (d.churned / maxVal) * 100 : 0;
            return (
              <div key={d.month} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1">
                  {/* New bar */}
                  <div className="relative w-5 h-[120px]">
                    {d.new > 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-primary"
                        style={{ height: `${newH}%` }}
                      />
                    )}
                  </div>
                  {/* Churned bar */}
                  <div className="relative w-5 h-[120px]">
                    {d.churned > 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-destructive/70"
                        style={{ height: `${churnH}%` }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
