"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TrendData {
  month: string;
  new: number;
  churned: number;
}

export function CustomerTrend() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/insights/trends");
        if (!res.ok) throw new Error("Gagal memuat trend data");
        const json: TrendData[] = await res.json();
        setTrendData(json);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat trend data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxVal = Math.max(1, ...trendData.flatMap((d) => [d.new, d.churned]));

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-end justify-between">
            {trendData.map((d) => {
              const newH = maxVal > 0 ? (d.new / maxVal) * 100 : 0;
              const churnH = maxVal > 0 ? (d.churned / maxVal) * 100 : 0;
              return (
                <div key={d.month} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1">
                    <div className="relative w-5 h-[120px]">
                      {d.new > 0 && (
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t bg-primary"
                          style={{ height: `${newH}%` }}
                        />
                      )}
                    </div>
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
        )}
      </CardContent>
    </Card>
  );
}
