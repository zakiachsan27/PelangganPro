"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyCompact } from "@/lib/format";
import { TrendingUp, Loader2 } from "lucide-react";

interface RevenueData {
  month: string;
  year: number;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`/api/dashboard/revenue?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error("Gagal memuat data revenue");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent re-fetch on tab switch (React re-mount)
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchRevenue();
  }, []);

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
          {loading ? (
            <div className="flex items-center justify-center h-[180px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasData ? (
            <div className="flex items-end gap-3">
              {data.map((d) => {
                const maxRevenue = Math.max(...data.map((x) => x.revenue));
                const heightPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={`${d.month}-${d.year}`} className="flex-1 flex flex-col items-center gap-1">
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
