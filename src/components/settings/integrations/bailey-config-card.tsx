"use client";

import { LogOut, QrCode, RefreshCw, Smartphone, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "./session-status-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import type { WaSession } from "@/types";

interface BaileyConfigCardProps {
  isActive: boolean;
  isDisabled: boolean;
  session: WaSession | null;
  onActivate: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onReconnect: () => Promise<void>;
}

export function BaileyConfigCard({
  isActive,
  isDisabled,
  session,
  onActivate,
  onDisconnect,
  onReconnect,
}: BaileyConfigCardProps) {
  const [activating, setActivating] = useState(false);
  const isConnected = session?.status === "connected";
  const isQrPending = session?.status === "qr_pending";
  const isConnecting = session?.status === "connecting";

  const handleActivate = async () => {
    setActivating(true);
    try {
      await onActivate();
      toast.info("Menunggu QR code...");
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai sesi");
    } finally {
      setActivating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      toast.success("Bailey diputuskan");
    } catch {
      toast.error("Gagal memutuskan sesi");
    }
  };

  const handleReconnect = async () => {
    try {
      await onReconnect();
      toast.info("Menghubungkan ulang...");
    } catch {
      toast.error("Gagal menghubungkan ulang");
    }
  };

  return (
    <Card className={cn("transition-opacity", isDisabled && "opacity-50")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Bailey (WA Web)</CardTitle>
          {session && isActive && <SessionStatusBadge status={session.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Koneksikan WhatsApp Web melalui QR code scan. Gratis, cocok untuk tim kecil.
        </p>

        {isDisabled ? (
          <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Provider lain sedang aktif</p>
            <Button variant="outline" size="sm" onClick={handleActivate} disabled={activating}>
              {activating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Ganti ke Bailey
            </Button>
          </div>
        ) : isConnected && isActive && session ? (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{session.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Phone: {session.phone_number}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleReconnect}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Ganti Akun
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDisconnect}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Putuskan
              </Button>
            </div>
          </div>
        ) : isQrPending && session?.qr_code_data ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.qr_code_data}
              alt="WhatsApp QR Code"
              className="w-48 h-48"
            />
            <p className="text-sm text-muted-foreground text-center">
              Scan QR code ini dengan WhatsApp di handphone Anda
            </p>
          </div>
        ) : isConnecting || (activating) ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Menghubungkan ke WhatsApp...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6">
            <QrCode className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              Scan QR code dengan WhatsApp di handphone Anda
            </p>
            <Button onClick={handleActivate} disabled={activating}>
              {activating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              Generate QR Code
            </Button>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3">
          <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Multi-user:</span>{" "}
            Semua agent dalam tim bisa akses WhatsApp yang sama. Pesan outbound akan mencatat nama agent pengirim.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
