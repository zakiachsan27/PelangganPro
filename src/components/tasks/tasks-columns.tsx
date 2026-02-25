"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, AlertTriangle, Calendar } from "lucide-react";
import { getInitials, formatDate } from "@/lib/format";
import type { Task, TaskPriority, TaskStatus } from "@/types";

function getPriorityVariant(priority: TaskPriority) {
  switch (priority) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "default" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
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

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
}

export const tasksColumns: ColumnDef<Task>[] = [
  {
    id: "check",
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.status === "done"}
        className="border-border"
      />
    ),
    size: 40,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Task
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const task = row.original;
      const overdue = isOverdue(task.due_date, task.status);
      return (
        <div>
          <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              {task.description}
            </p>
          )}
          {overdue && (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium mt-0.5">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge variant={getPriorityVariant(row.original.priority)} className="text-xs">
        {row.original.priority}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[row.original.status]}`}>
        {statusLabels[row.original.status]}
      </span>
    ),
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const task = row.original;
      const overdue = isOverdue(task.due_date, task.status);
      return task.due_date ? (
        <span className={`flex items-center gap-1 text-sm ${overdue ? "text-destructive font-medium" : ""}`}>
          <Calendar className="h-3 w-3" />
          {formatDate(task.due_date)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{getInitials(assignee.full_name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{assignee.full_name.split(" ")[0]}</span>
        </div>
      );
    },
  },
  {
    id: "linked",
    header: "Linked",
    cell: ({ row }) => {
      const task = row.original;
      const contact = task.contact;
      const deal = task.deal;
      return (
        <div className="text-xs text-muted-foreground space-y-0.5">
          {contact && (
            <Link href={`/contacts/${contact.id}`} className="block hover:underline">
              {contact.first_name} {contact.last_name || ""}
            </Link>
          )}
          {deal && (
            <Link href={`/deals/${deal.id}`} className="block hover:underline">
              {deal.title}
            </Link>
          )}
          {!contact && !deal && "-"}
        </div>
      );
    },
  },
];
