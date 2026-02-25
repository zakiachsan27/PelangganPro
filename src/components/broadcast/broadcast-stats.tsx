"use client";

import { useState, useEffect } from "react";
import { Send, CheckCheck, Eye, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { BroadcastCampaign } from "@/types";

export function BroadcastStats() {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/broadcast/campaigns?status=sent");
        if (!res.ok) throw new Error("Gagal memuat stats");
        const json = await res.json();
        setCampaigns(json.data ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat stats");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0);
  const totalRead = campaigns.reduce((sum, c) => sum + c.stats.read, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.stats.failed, 0);
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

  const stats = [
    { label: "Total Terkirim", value: totalSent.toString(), icon: Send, color: "text-primary" },
    { label: "Delivery Rate", value: `${deliveryRate}%`, icon: CheckCheck, color: "text-emerald-500" },
    { label: "Read Rate", value: `${readRate}%`, icon: Eye, color: "text-blue-500" },
    { label: "Gagal", value: totalFailed.toString(), icon: AlertCircle, color: "text-destructive" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
