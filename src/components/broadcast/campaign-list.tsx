"use client";

import { useState, useEffect, useCallback } from "react";
import { CampaignCard } from "./campaign-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BroadcastCampaign, BroadcastChannel, BroadcastStatus } from "@/types";

type FilterChannel = BroadcastChannel | "all";
type FilterStatus = BroadcastStatus | "all";

export function CampaignList() {
  const [channelFilter, setChannelFilter] = useState<FilterChannel>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (channelFilter !== "all") params.set("channel", channelFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/broadcast/campaigns?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat campaigns");
      const json = await res.json();
      setCampaigns(json.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat campaigns");
    } finally {
      setLoading(false);
    }
  }, [channelFilter, statusFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as FilterChannel)}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Channel</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="sent">Terkirim</SelectItem>
            <SelectItem value="scheduled">Terjadwal</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Tidak ada campaign yang cocok dengan filter.
          </p>
        </div>
      )}
    </div>
  );
}
