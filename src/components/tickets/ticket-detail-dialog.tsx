"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, User, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelativeTime, getInitials } from "@/lib/format";
import { toast } from "sonner";
import { ticketStatusLabels, ticketCategoryLabels } from "./tickets-columns";
import type { Ticket, TicketComment, TicketStatus, TicketPriority, TicketCategory, Profile } from "@/types";

interface TicketDetailDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-600",
  in_progress: "bg-primary/10 text-primary",
  waiting: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-success/15 text-success-foreground",
  closed: "bg-secondary text-secondary-foreground",
};

const priorityColors: Record<TicketPriority, string> = {
  urgent: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

function getCategoryVariant(category: TicketCategory) {
  switch (category) {
    case "bug": return "destructive" as const;
    case "feature_request": return "default" as const;
    case "pertanyaan": return "secondary" as const;
    case "keluhan_pelanggan": return "outline" as const;
    case "internal": return "outline" as const;
  }
}

export function TicketDetailDialog({ ticket, open, onOpenChange, onUpdated }: TicketDetailDialogProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!ticket) return;
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/tickets/${ticket.id}/comments`);
      if (!res.ok) throw new Error("Gagal memuat komentar");
      const json = await res.json();
      setComments(json.data ?? json);
    } catch {
      // Silently fail for comments
    } finally {
      setLoadingComments(false);
    }
  }, [ticket]);

  const fetchUsers = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, is_active")
        .eq("is_active", true)
        .order("full_name");
      if (data) setUsers(data as Profile[]);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (open && ticket) {
      fetchComments();
      fetchUsers();
    }
  }, [open, ticket, fetchComments, fetchUsers]);

  if (!ticket) return null;

  const assignee = ticket.assignee || null;
  const reporter = ticket.reporter || null;
  const contact = ticket.contact || null;

  async function handleAddComment() {
    if (!comment.trim() || !ticket) return;
    try {
      setSendingComment(true);
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (!res.ok) throw new Error("Gagal mengirim komentar");
      toast.success("Komentar berhasil ditambahkan");
      setComment("");
      fetchComments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim komentar");
    } finally {
      setSendingComment(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      toast.success(`Status diubah ke ${ticketStatusLabels[newStatus as TicketStatus]}`);
      onUpdated?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  }

  async function handleAssigneeChange(newAssigneeId: string) {
    if (!ticket) return;
    try {
      const assigneeId = newAssigneeId === "unassigned" ? null : newAssigneeId;
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee_id: assigneeId }),
      });
      if (!res.ok) throw new Error("Gagal mengubah assignee");
      const user = users.find((u) => u.id === newAssigneeId);
      toast.success(`Assignee diubah ke ${user?.full_name || "Unassigned"}`);
      onUpdated?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah assignee");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setComment(""); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6">{ticket.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status, Priority, Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status]}`}>
              {ticketStatusLabels[ticket.status]}
            </span>
            <Badge variant={priorityColors[ticket.priority] as "destructive" | "default" | "secondary" | "outline"} className="text-xs">
              {ticket.priority}
            </Badge>
            <Badge variant={getCategoryVariant(ticket.category)} className="text-xs">
              {ticketCategoryLabels[ticket.category]}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{ticket.description}</p>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ticketStatusLabels) as [TicketStatus, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assignee</p>
              <Select
                value={ticket.assignee_id || "unassigned"}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-2 text-sm">
            {reporter && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Reporter</span>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px]">{getInitials(reporter.full_name)}</AvatarFallback>
                </Avatar>
                <span>{reporter.full_name}</span>
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Assignee</span>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px]">{getInitials(assignee.full_name)}</AvatarFallback>
                </Avatar>
                <span>{assignee.full_name}</span>
              </div>
            )}
            {contact && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Contact</span>
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <Link href={`/contacts/${contact.id}`} className="hover:underline">
                  {contact.first_name} {contact.last_name || ""}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">Dibuat</span>
              <span className="text-muted-foreground">{formatRelativeTime(ticket.created_at)}</span>
            </div>
          </div>

          <Separator />

          {/* Komentar Section */}
          <div>
            <p className="text-sm font-medium mb-3">
              Komentar ({loadingComments ? "..." : comments.length})
            </p>

            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {comments.map((c) => {
                  const author = c.author || null;
                  return (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[8px]">
                          {author ? getInitials(author.full_name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{author?.full_name || "Unknown"}</span>
                          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Tulis komentar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || sendingComment}>
                  {sendingComment ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3 w-3" />
                  )}
                  Kirim
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
