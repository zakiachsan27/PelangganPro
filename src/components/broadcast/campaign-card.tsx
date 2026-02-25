import { Mail, MessageSquare, Clock, Send, AlertCircle, FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RfmBadge } from "@/components/segments/rfm-badge";
import type { BroadcastCampaign } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: BroadcastCampaign;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  scheduled: { label: "Terjadwal", variant: "outline", icon: Clock },
  sending: { label: "Mengirim...", variant: "default", icon: Send },
  sent: { label: "Terkirim", variant: "default", icon: Send },
  failed: { label: "Gagal", variant: "destructive", icon: AlertCircle },
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const StatusIcon = status.icon;
  const ChannelIcon = campaign.channel === "whatsapp" ? MessageSquare : Mail;
  const hasStats = campaign.stats.sent > 0;
  const deliveryRate = hasStats ? Math.round((campaign.stats.delivered / campaign.stats.sent) * 100) : 0;
  const readRate = hasStats ? Math.round((campaign.stats.read / campaign.stats.sent) * 100) : 0;

  return (
    <Card className="hover:bg-card hover:shadow-md transition-all duration-200">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{campaign.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <ChannelIcon className="h-3 w-3" />
                {campaign.channel === "whatsapp" ? "WhatsApp" : "Email"}
              </Badge>
              <Badge variant={status.variant} className="text-xs gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {campaign.sent_at
              ? formatRelativeTime(campaign.sent_at)
              : campaign.scheduled_at
                ? `Jadwal: ${new Date(campaign.scheduled_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
                : "—"}
          </span>
        </div>

        {/* Target Segments */}
        <div className="flex flex-wrap gap-1">
          {campaign.target_segments.map((seg) => (
            <RfmBadge key={seg} segment={seg} className="text-[10px]" />
          ))}
          <span className="text-xs text-muted-foreground self-center ml-1">
            ({campaign.target_count} penerima)
          </span>
        </div>

        {/* Stats */}
        {hasStats && (
          <div className="flex items-center gap-4 pt-2 border-t text-xs">
            <div>
              <span className="text-muted-foreground">Terkirim: </span>
              <span className="font-medium">{campaign.stats.sent}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Delivered: </span>
              <span className={cn("font-medium", deliveryRate >= 80 ? "text-emerald-600" : "text-amber-600")}>
                {deliveryRate}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Dibaca: </span>
              <span className={cn("font-medium", readRate >= 50 ? "text-emerald-600" : "text-amber-600")}>
                {readRate}%
              </span>
            </div>
            {campaign.stats.failed > 0 && (
              <div>
                <span className="text-muted-foreground">Gagal: </span>
                <span className="font-medium text-destructive">{campaign.stats.failed}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
