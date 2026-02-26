"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  TicketCheck, 
  MessageSquare, 
  Send,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/format";
import { toast } from "sonner";
import type { Ticket, TicketComment, Profile } from "@/types";

const ticketStatusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting: "Menunggu",
  resolved: "Resolved",
  closed: "Closed",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600",
  in_progress: "bg-primary/10 text-primary",
  waiting: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-success/15 text-success-foreground",
  closed: "bg-secondary text-secondary-foreground",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Ticket tidak ditemukan");
          router.push("/tickets");
          return;
        }
        throw new Error("Failed to fetch ticket");
      }
      const data = await res.json();
      setTicket(data);
    } catch (error) {
      toast.error("Gagal memuat ticket");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.data || data);
    } catch (error) {
      // Silently fail
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/profiles?limit=100");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    if (ticketId) {
      setLoading(true);
      Promise.all([fetchTicket(), fetchComments(), fetchUsers()]).finally(() => {
        setLoading(false);
      });
    }
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      toast.success("Komentar berhasil ditambahkan");
      setComment("");
      fetchComments();
    } catch (error) {
      toast.error("Gagal menambahkan komentar");
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status diubah ke ${ticketStatusLabels[newStatus]}`);
      fetchTicket();
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    try {
      const assigneeId = newAssigneeId === "unassigned" ? null : newAssigneeId;
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee_id: assigneeId }),
      });
      if (!res.ok) throw new Error("Failed to update assignee");
      const user = users.find((u) => u.id === newAssigneeId);
      toast.success(user ? `Assignee diubah ke ${user.full_name}` : "Assignee dihapus");
      fetchTicket();
    } catch (error) {
      toast.error("Gagal mengubah assignee");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold">Ticket tidak ditemukan</h1>
        <Button asChild className="mt-4">
          <Link href="/tickets">Kembali ke Daftar Tickets</Link>
        </Button>
      </div>
    );
  }

  const assignee = ticket.assignee;
  const reporter = ticket.reporter;
  const contact = ticket.contact;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[ticket.status]}`}>
              {ticketStatusLabels[ticket.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ticket #{ticket.id.slice(0, 8)} • Dibuat {" "}
            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: id })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TicketCheck className="h-4 w-4" />
                Deskripsi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Komentar ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {c.author ? getInitials(c.author.full_name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{c.author?.full_name || "Unknown"}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: id })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap pl-8">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada komentar
                </p>
              )}

              {/* Add Comment */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <Textarea
                  placeholder="Tulis komentar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="bg-white resize-none"
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={!comment.trim() || sendingComment}
                  >
                    {sendingComment ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-3 w-3" />
                    )}
                    Kirim
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ticketStatusLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Assignee</label>
                <Select 
                  value={ticket.assignee_id || "unassigned"} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Belum ditugaskan</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                {reporter && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">Reporter</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {getInitials(reporter.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{reporter.full_name}</span>
                    </div>
                  </div>
                )}

                {assignee && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">Assignee</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {getInitials(assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{assignee.full_name}</span>
                    </div>
                  </div>
                )}

                {contact && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">Kontak</span>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Link 
                        href={`/contacts/${contact.id}`} 
                        className="hover:underline font-medium text-primary"
                      >
                        {contact.first_name} {contact.last_name || ""}
                      </Link>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Priority</span>
                  <Badge variant={
                    ticket.priority === "urgent" ? "destructive" :
                    ticket.priority === "high" ? "default" :
                    ticket.priority === "medium" ? "secondary" : "outline"
                  }>
                    {ticket.priority}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Kategori</span>
                  <Badge variant="outline">
                    {ticket.category.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Dibuat</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
