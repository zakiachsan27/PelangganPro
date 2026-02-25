"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * 5x5 heatmap grid: Recency (Y axis, top=5) vs Frequency (X axis, left=1)
 * Cell color intensity based on customer count
 */
export function RfmHeatmap() {
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 5 }, () => Array(5).fill(0))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/insights/heatmap");
        if (!res.ok) throw new Error("Gagal memuat heatmap");
        const json: { matrix: number[][] } = await res.json();
        setMatrix(json.matrix);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat heatmap");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCount = Math.max(1, ...matrix.flat());

  function getCellColor(count: number): string {
    if (count === 0) return "bg-muted/50";
    const intensity = count / maxCount;
    if (intensity > 0.7) return "bg-primary text-primary-foreground";
    if (intensity > 0.4) return "bg-primary/60 text-primary-foreground";
    if (intensity > 0) return "bg-primary/25";
    return "bg-muted/50";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">RFM Heatmap</CardTitle>
        <p className="text-xs text-muted-foreground">
          Distribusi pelanggan berdasarkan Recency ({"\u2191"}) vs Frequency ({"\u2192"})
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex gap-3">
            {/* Y-axis label */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground -rotate-90 whitespace-nowrap">
                Recency
              </span>
            </div>

            <div className="flex-1 space-y-1">
              {/* Grid rows (recency 5 at top -> 1 at bottom) */}
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center gap-1">
                  <span className="w-4 text-[10px] text-muted-foreground text-right">{r}</span>
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((f) => {
                      const count = matrix[r - 1][f - 1];
                      return (
                        <div
                          key={`${r}-${f}`}
                          className={cn(
                            "aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors",
                            getCellColor(count)
                          )}
                          title={`R=${r}, F=${f}: ${count} pelanggan`}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* X-axis labels */}
              <div className="flex items-center gap-1">
                <span className="w-4" />
                <div className="flex-1 grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((f) => (
                    <span key={f} className="text-center text-[10px] text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-1">Frequency</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
