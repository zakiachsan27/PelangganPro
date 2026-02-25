"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";

const emptyStages = [
  { stage: "Lead", count: 0, value: 0, color: "#3b82f6" },
  { stage: "Qualified", count: 0, value: 0, color: "#8b5cf6" },
  { stage: "Proposal", count: 0, value: 0, color: "#f59e0b" },
  { stage: "Negotiation", count: 0, value: 0, color: "#f97316" },
  { stage: "Closed Won", count: 0, value: 0, color: "#10b981" },
];

export function PipelineFunnelChart() {
  const hasData = emptyStages.some((s) => s.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {emptyStages.map((stage) => {
              const maxCount = Math.max(...emptyStages.map((s) => s.count));
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
