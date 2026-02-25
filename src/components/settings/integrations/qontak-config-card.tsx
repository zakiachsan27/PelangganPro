"use client";

import { useState, useEffect } from "react";
import { Key, LogOut, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SessionStatusBadge } from "./session-status-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { WaSession } from "@/types";

interface QontakConfigCardProps {
  isActive: boolean;
  isDisabled: boolean;
  onActivate: () => void;
  onDisconnect: () => void;
}

export function QontakConfigCard({ isActive, isDisabled, onActivate, onDisconnect }: QontakConfigCardProps) {
  const [qontakSession, setQontakSession] = useState<WaSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const res = await fetch("/api/wa/sessions");
        if (!res.ok) throw new Error("Gagal memuat sesi WA");
        const json = await res.json();
        const sessions: WaSession[] = json.data ?? json;
        const qontak = sessions.find((s) => s.provider === "qontak") || null;
        setQontakSession(qontak);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const isConnected = qontakSession?.status === "connected";

  if (loading) {
    return (
      <Card className={cn("transition-opacity", isDisabled && "opacity-50")}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-opacity",
      isDisabled && "opacity-50"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Qontak (Official API)</CardTitle>
          {isConnected && isActive && <SessionStatusBadge status="connected" />}
          {!isConnected && isActive && <SessionStatusBadge status="disconnected" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          WhatsApp Business API resmi via Mekari Qontak. Berbayar, cocok untuk scale besar.
        </p>

        {isDisabled ? (
          <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Provider lain sedang aktif
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onActivate();
                toast.info("Beralih ke Qontak — provider sebelumnya diputuskan");
              }}
            >
              Ganti ke Qontak
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="api-key" className="text-xs">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    defaultValue={qontakSession?.api_key || ""}
                    placeholder="Masukkan API key Qontak"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Edit API key (demo)")}
                  >
                    <Key className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="channel-id" className="text-xs">Channel ID</Label>
                <Input
                  id="channel-id"
                  defaultValue={isConnected ? "ch-wa-001" : ""}
                  placeholder="Masukkan Channel ID"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  onActivate();
                  toast.success("Settings saved (demo)");
                }}
              >
                {isConnected ? "Save Configuration" : "Hubungkan Qontak"}
              </Button>
              {isActive && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onDisconnect();
                    toast.success("Qontak diputuskan");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Official API:</span>{" "}
            Menggunakan WhatsApp Business API resmi. Lebih stabil dan tidak perlu scan QR code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
