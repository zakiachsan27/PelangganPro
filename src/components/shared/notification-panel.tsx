"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/format";

const actionLabels: Record<string, string> = {
  created: "membuat",
  updated: "mengupdate",
  stage_changed: "memindahkan stage",
  note_added: "menambah catatan",
  won: "memenangkan deal",
  lost: "mengalahkan deal",
  converted: "mengkonversi",
  assigned: "mengassign",
  tagged: "menambah tag",
};

const entityLabels: Record<string, string> = {
  contact: "kontak",
  deal: "deal",
  company: "perusahaan",
  task: "task",
};

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  actor_id?: string;
  actor?: { full_name: string };
  created_at: string;
}

export function NotificationPanel() {
  const [hasUnread, setHasUnread] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Activities API currently requires entity_type and entity_id params.
    // For a global "recent activity" feed we leave this as empty for now
    // until a dedicated notifications or global activity endpoint is available.
    setActivities([]);
  }, []);

  function markAllRead() {
    setHasUnread(false);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifikasi</h4>
          {hasUnread && (
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={markAllRead}>
              <Check className="h-3 w-3" />
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Belum ada notifikasi
            </div>
          ) : (
            activities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 border-b last:border-0 transition-colors"
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${hasUnread && idx < 3 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{activity.actor?.full_name || "System"}</span>{" "}
                    {actionLabels[activity.action] || activity.action}{" "}
                    {entityLabels[activity.entity_type] || activity.entity_type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
