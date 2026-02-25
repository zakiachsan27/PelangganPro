"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoteForm } from "@/components/notes/note-form";
import { Calendar, User, AlertTriangle } from "lucide-react";
import { formatDate, getInitials } from "@/lib/format";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary/10 text-primary",
  done: "bg-success/15 text-success-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<TaskPriority, string> = {
  urgent: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  if (!task) return null;

  const assignee = task.assignee;
  const contact = task.contact;
  const deal = task.deal;

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    task.status !== "cancelled" &&
    new Date(task.due_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-6">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Priority */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
              {statusLabels[task.status]}
            </span>
            <Badge variant={priorityColors[task.priority] as "destructive" | "default" | "secondary" | "outline"} className="text-xs">
              {task.priority}
            </Badge>
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select
                value={task.status}
                onValueChange={(v) => {
                  toast.success(`Status diubah ke ${statusLabels[v as TaskStatus]}`);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(statusLabels) as [TaskStatus, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <Select
                value={task.priority}
                onValueChange={(v) => {
                  toast.success(`Priority diubah ke ${v}`);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-2 text-sm">
            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  {formatDate(task.due_date)}
                </span>
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">{getInitials(assignee.full_name)}</AvatarFallback>
                </Avatar>
                <span>{assignee.full_name}</span>
              </div>
            )}
            {contact && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <Link href={`/contacts/${contact.id}`} className="hover:underline">
                  {contact.first_name} {contact.last_name || ""}
                </Link>
              </div>
            )}
            {deal && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Deal:</span>
                <Link href={`/deals/${deal.id}`} className="text-sm hover:underline">
                  {deal.title}
                </Link>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <p className="text-sm font-medium mb-2">Catatan</p>
            <NoteForm onSubmit={(content) => console.log("Task note:", content)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
