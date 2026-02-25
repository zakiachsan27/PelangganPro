"use client";

import { useState } from "react";
import { WahaConfigCard } from "./waha-config-card";
import { QontakConfigCard } from "./qontak-config-card";
import { WaSessionList } from "./wa-session-list";
import { useWaSessions } from "@/hooks/use-wa-sessions";
import type { WaProvider } from "@/types";

export function IntegrationsPage() {
  const { sessions, loading, createSession, startSession, disconnectSession } = useWaSessions();

  const connectedSession = sessions.find((s) => s.status === "connected");
  const [activeProvider, setActiveProvider] = useState<WaProvider | null>(
    connectedSession?.provider ?? null
  );

  // Find the latest WAHA session (prefer non-disconnected, fallback to any)
  const wahaSession = sessions.find(
    (s) => s.provider === "waha" && s.status !== "disconnected"
  ) || sessions.find(
    (s) => s.provider === "waha"
  );
  // For the card display: treat disconnected as "no active session" so it shows QR button
  const wahaCardSession = wahaSession?.status === "disconnected" ? null : wahaSession;
  const effectiveActive = connectedSession?.provider ?? activeProvider;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">WhatsApp Integration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Hubungkan WhatsApp untuk berkomunikasi langsung dengan kontak dari CRM.
          Pilih salah satu provider.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WahaConfigCard
          isActive={effectiveActive === "waha"}
          isDisabled={effectiveActive === "qontak"}
          session={wahaCardSession ?? null}
          onActivate={async () => {
            setActiveProvider("waha");
            if (!wahaSession) {
              // No session at all — create a new DB row + start WAHA
              await createSession("WA Business", "waha");
            } else {
              // Reuse existing DB row — start endpoint will create fresh WAHA session
              await startSession(wahaSession.id);
            }
          }}
          onDisconnect={async () => {
            if (wahaSession) {
              await disconnectSession(wahaSession.id);
            }
            setActiveProvider(null);
          }}
          onReconnect={async () => {
            if (wahaSession) {
              await disconnectSession(wahaSession.id);
              await startSession(wahaSession.id);
            }
          }}
        />
        <QontakConfigCard
          isActive={effectiveActive === "qontak"}
          isDisabled={effectiveActive === "waha"}
          onActivate={() => setActiveProvider("qontak")}
          onDisconnect={() => setActiveProvider(null)}
        />
      </div>

      <WaSessionList sessions={sessions} loading={loading} />
    </div>
  );
}
