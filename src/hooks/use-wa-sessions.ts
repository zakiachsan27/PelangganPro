"use client";

import { useState, useEffect, useCallback } from "react";
import type { WaSession } from "@/types";
import { useWaRealtime } from "./use-wa-realtime";

export function useWaSessions() {
  const [sessions, setSessions] = useState<WaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/wa/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Real-time session updates (QR code, connection status)
  useWaRealtime({
    onSessionUpdate: (session) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? session : s))
      );
    },
  });

  // Create + start session
  const createSession = useCallback(
    async (label: string, provider: string = "waha") => {
      const res = await fetch("/api/wa/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, provider }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create session");
      }
      const session = await res.json();
      setSessions((prev) => [session, ...prev]);
      return session as WaSession;
    },
    []
  );

  // Reconnect an existing session
  const startSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/wa/sessions/${sessionId}/start`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to start session");
    }
  }, []);

  // Disconnect
  const disconnectSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/wa/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to disconnect");
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "disconnected" as const, qr_code_data: null, phone_number: null }
          : s
      )
    );
  }, []);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    createSession,
    startSession,
    disconnectSession,
  };
}
