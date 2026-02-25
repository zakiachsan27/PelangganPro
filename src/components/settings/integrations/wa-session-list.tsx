"use client";

import { Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderBadge } from "@/components/messaging/provider-badge";
import { SessionStatusBadge } from "./session-status-badge";
import { formatRelativeTime } from "@/lib/format";
import type { WaSession } from "@/types";

interface WaSessionListProps {
  sessions: WaSession[];
  loading: boolean;
}

export function WaSessionList({ sessions, loading }: WaSessionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada session aktif</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{session.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {session.phone_number || "No number"}
                      </span>
                      <ProviderBadge provider={session.provider} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <SessionStatusBadge status={session.status} />
                  {session.connected_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(session.connected_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
