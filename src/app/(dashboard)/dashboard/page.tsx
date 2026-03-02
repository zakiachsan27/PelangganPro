"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Ticket, CheckSquare, Activity, TrendingUp, Clock, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIAgentChat } from "@/components/agent/ai-agent-chat";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

interface TicketItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  description?: string;
  category?: string;
  image_url?: string;
  assignee?: {
    full_name: string;
  };
  contact?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  color: string;
}

interface DashboardStats {
  openTickets: number;
  dueTasks: number;
  todayActivities: number;
  pipelineValue: number;
  totalContacts: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [showAIAgent, setShowAIAgent] = useState(true);
  
  // Dialog states
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          openTickets: statsData.openTickets || 0,
          dueTasks: statsData.tasksDueToday || 0,
          todayActivities: statsData.todayActivities || 0,
          pipelineValue: statsData.openDealsValue || 0,
          totalContacts: statsData.totalContacts || 0,
        });
      }

      // Fetch open tickets
      const ticketsRes = await fetch("/api/tickets?status=open");
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.data?.slice(0, 5) || []);
      }

      // Fetch pipeline data
      const pipelineRes = await fetch("/api/dashboard/pipeline");
      if (pipelineRes.ok) {
        const pipelineData = await pipelineRes.json();
        setPipelineData(pipelineData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoadingTickets(false);
      setLoadingPipeline(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTicketClick = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      bug: "Bug",
      feature_request: "Permintaan Fitur",
      pertanyaan: "Pertanyaan",
      keluhan_pelanggan: "Keluhan Pelanggan",
      internal: "Internal",
    };
    return labels[category || ""] || category || "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau aktivitas terkini dan upcoming tasks</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Asisten AI */}
      <AIAgentChat isOpen={showAIAgent} onToggle={() => setShowAIAgent(!showAIAgent)} />

      {/* Main Content Grid - 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Tickets & Tasks */}
        <div className="space-y-6">
          {/* Tickets Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Tickets Open
                  <Badge variant="secondary">{stats?.openTickets || 0}</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-foreground">
                  <a href="/tickets">Lihat Semua</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTickets ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada tickets yang sedang berlangsung</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{ticket.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(ticket.created_at).toLocaleDateString("id-ID")}</span>
                          {ticket.contact && (
                            <span>• {ticket.contact.first_name} {ticket.contact.last_name}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Tasks Due Today
                  <Badge variant="secondary">{stats?.dueTasks || 0}</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-foreground">
                  <a href="/tasks">Lihat Semua</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Section Reminder akan ditampilkan di sini</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href="/tasks">Buka Tasks</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pipeline
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-foreground">
                <a href="/deals">Lihat Semua</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPipeline ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : pipelineData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Tidak ada data pipeline</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pipelineData.map((stage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.count} deals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(stage.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedTicket.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge variant="secondary">{selectedTicket.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Kategori</p>
                  <p className="font-medium">{getCategoryLabel(selectedTicket.category)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dibuat</p>
                  <p className="font-medium">
                    {new Date(selectedTicket.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {selectedTicket.assignee && (
                  <div>
                    <p className="text-muted-foreground">Assignee</p>
                    <p className="font-medium">{selectedTicket.assignee.full_name}</p>
                  </div>
                )}
                {selectedTicket.contact && (
                  <div>
                    <p className="text-muted-foreground">User yang Dituju</p>
                    <p className="font-medium">{selectedTicket.contact.first_name} {selectedTicket.contact.last_name}</p>
                  </div>
                )}
              </div>

              {selectedTicket.description && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Deskripsi</p>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
              )}

              {selectedTicket.image_url && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Lampiran</p>
                  <a
                    href={selectedTicket.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {selectedTicket.image_url}
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setTicketDialogOpen(false)}>
                  Tutup
                </Button>
                <Button className="flex-1" asChild>
                  <a href={`/tickets/${selectedTicket.id}`}>Buka Detail</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
