"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { MessageScheduler, MessageSchedulerLog } from "@/types";

export default function SchedulerHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const schedulerId = params.id as string;
  
  const [scheduler, setScheduler] = useState<MessageScheduler | null>(null);
  const [logs, setLogs] = useState<MessageSchedulerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  useEffect(() => {
    if (schedulerId) {
      fetchScheduler();
      fetchLogs();
    }
  }, [schedulerId]);

  async function fetchScheduler() {
    try {
      const res = await fetch(`/api/scheduler/${schedulerId}`);
      if (!res.ok) throw new Error("Failed to fetch scheduler");
      const data = await res.json();
      setScheduler(data);
    } catch (error) {
      toast.error("Gagal memuat jadwal");
      router.push("/scheduler");
    }
  }

  async function fetchLogs() {
    try {
      const res = await fetch(`/api/scheduler/${schedulerId}/logs`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (selectedLogs.length === 0) {
      toast.error("Pilih log yang gagal untuk retry");
      return;
    }

    try {
      const res = await fetch(`/api/scheduler/${schedulerId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_ids: selectedLogs }),
      });

      if (!res.ok) throw new Error("Failed to retry");
      
      toast.success("Pesan dijadwalkan ulang");
      setSelectedLogs([]);
      fetchLogs();
    } catch (error) {
      toast.error("Gagal retry");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Terkirim</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case "retrying":
        return <Badge className="bg-yellow-500"><RefreshCw className="h-3 w-3 mr-1" />Retry</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const failedLogs = logs.filter((log) => log.status === "failed");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/scheduler")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{scheduler?.name}</h1>
          <p className="text-sm text-muted-foreground">Riwayat Pengiriman</p>
        </div>
        {failedLogs.length > 0 && (
          <Button onClick={handleRetry} disabled={selectedLogs.length === 0}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry ({selectedLogs.length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Terkirim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.status === "sent").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.status === "failed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {logs.filter((l) => l.status === "pending").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada riwayat pengiriman</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {failedLogs.length > 0 && <TableHead className="w-[50px]"></TableHead>}
                  <TableHead>Kontak</TableHead>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    {failedLogs.length > 0 && (
                      <TableCell>
                        {log.status === "failed" && (
                          <input
                            type="checkbox"
                            checked={selectedLogs.includes(log.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLogs([...selectedLogs, log.id]);
                              } else {
                                setSelectedLogs(selectedLogs.filter((id) => id !== log.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {log.contact?.first_name} {log.contact?.last_name}
                    </TableCell>
                    <TableCell>{log.phone}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.sent_at 
                        ? new Date(log.sent_at).toLocaleString("id-ID")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-red-500 text-sm">
                      {log.error_message || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
