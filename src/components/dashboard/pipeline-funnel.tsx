"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Loader2 } from "lucide-react";

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  color: string;
}

export function PipelineFunnelChart() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`/api/dashboard/pipeline?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error("Gagal memuat data pipeline");
      const json = await res.json();
      setStages(json.data || []);
    } catch (err) {
      console.error("Error fetching pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent re-fetch on tab switch (React re-mount)
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchPipeline();
  }, []);

  const hasData = stages.some((s) => s.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasData ? (
          <div className="space-y-3">
            {stages.map((stage) => {
              const maxCount = Math.max(...stages.map((s) => s.count));
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {stage.count} deals
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted/60">
                    <div
                      className="h-2.5 rounded-full transition-all duration-200"
                      style={{
                        width: maxCount > 0 ? `${(stage.count / maxCount) * 100}%` : "0%",
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <Layers className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Belum ada deals di pipeline</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
