"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Play, Pause, Square, History, Loader2, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { MessageScheduler } from "@/types";

export function SchedulerList() {
  const router = useRouter();
  const [schedulers, setSchedulers] = useState<MessageScheduler[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedulers();
    // Poll every 5 seconds when there are active schedulers
    const interval = setInterval(() => {
      const hasActive = schedulers.some((s) => s.status === "sending");
      if (hasActive) fetchSchedulers();
    }, 5000);
    return () => clearInterval(interval);
  }, [schedulers.length]);

  async function fetchSchedulers() {
    try {
      const res = await fetch("/api/scheduler");
      if (!res.ok) throw new Error("Failed to fetch schedulers");
      const data = await res.json();
      setSchedulers(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat jadwal pengiriman");
    } finally {
      setLoading(false);
    }
  }

  async function handleStart(schedulerId: string) {
    setProcessing(schedulerId);
    try {
      // Get WAHA session - for now use default
      const res = await fetch(`/api/scheduler/${schedulerId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waha_session: "default" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start scheduler");
      }

      toast.success("Pengiriman dimulai");
      fetchSchedulers();
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai pengiriman");
    } finally {
      setProcessing(null);
    }
  }

  async function handlePause(schedulerId: string) {
    setProcessing(schedulerId);
    try {
      const res = await fetch(`/api/scheduler/${schedulerId}/pause`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to pause scheduler");
      toast.success("Pengiriman dijeda");
      fetchSchedulers();
    } catch (error) {
      toast.error("Gagal menjeda pengiriman");
    } finally {
      setProcessing(null);
    }
  }

  async function handleStop(schedulerId: string) {
    setProcessing(schedulerId);
    try {
      const res = await fetch(`/api/scheduler/${schedulerId}/stop`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to stop scheduler");
      toast.success("Pengiriman dihentikan");
      fetchSchedulers();
    } catch (error) {
      toast.error("Gagal menghentikan pengiriman");
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete(schedulerId: string) {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    
    try {
      const res = await fetch(`/api/scheduler/${schedulerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete scheduler");
      toast.success("Jadwal berhasil dihapus");
      fetchSchedulers();
    } catch (error) {
      toast.error("Gagal menghapus jadwal");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu</Badge>;
      case "sending":
        return <Badge className="bg-blue-500">Mengirim</Badge>;
      case "paused":
        return <Badge variant="secondary">Dijeda</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Selesai</Badge>;
      case "failed":
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (schedulers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada jadwal pengiriman</h3>
        <p className="text-sm text-slate-500 mb-4">Buat jadwal untuk mengirim pesan ke banyak kontak</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedulers.map((scheduler) => (
            <TableRow key={scheduler.id}>
              <TableCell className="font-medium">
                <div>{scheduler.name}</div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {scheduler.message}
                </p>
              </TableCell>
              <TableCell>{getStatusBadge(scheduler.status)}</TableCell>
              <TableCell>
                <div className="w-[150px]">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(scheduler.sent_count / scheduler.total_count) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {scheduler.sent_count}/{scheduler.total_count}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {scheduler.target_type === "group" ? (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="text-sm">{scheduler.target_group?.name}</span>
                  </div>
                ) : (
                  <span className="text-sm">{scheduler.target_contacts?.length || 0} kontak</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">{scheduler.min_interval || Math.floor(scheduler.interval_seconds * 0.75)}-{scheduler.interval_seconds}d</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {scheduler.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleStart(scheduler.id)}
                      disabled={processing === scheduler.id}
                    >
                      {processing === scheduler.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {scheduler.status === "sending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePause(scheduler.id)}
                        disabled={processing === scheduler.id}
                      >
                        {processing === scheduler.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStop(scheduler.id)}
                        disabled={processing === scheduler.id}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {scheduler.status === "paused" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStart(scheduler.id)}
                        disabled={processing === scheduler.id}
                      >
                        {processing === scheduler.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStop(scheduler.id)}
                        disabled={processing === scheduler.id}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/scheduler/${scheduler.id}/history`)}>
                        <History className="mr-2 h-4 w-4" />
                        Lihat Riwayat
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(scheduler.id)}
                        className="text-red-600"
                        disabled={scheduler.status === "sending"}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
