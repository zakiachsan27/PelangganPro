"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { getInitials, formatRelativeTime } from "@/lib/format";
import type { Ticket, TicketPriority, TicketStatus, TicketCategory } from "@/types";

function getPriorityVariant(priority: TicketPriority) {
  switch (priority) {
    case "urgent": return "destructive" as const;
    case "high": return "default" as const;
    case "medium": return "secondary" as const;
    case "low": return "outline" as const;
  }
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting: "Menunggu",
  resolved: "Resolved",
  closed: "Closed",
};

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-600",
  in_progress: "bg-primary/10 text-primary",
  waiting: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-success/15 text-success-foreground",
  closed: "bg-secondary text-secondary-foreground",
};

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  bug: "Bug/Error",
  feature_request: "Feature Request",
  pertanyaan: "Pertanyaan",
  keluhan_pelanggan: "Keluhan Pelanggan",
  internal: "Internal",
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

export function getTicketsColumns(onTitleClick?: (ticket: Ticket) => void): ColumnDef<Ticket>[] {
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ticket
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <button
          type="button"
          className="text-left"
          onClick={() => onTitleClick?.(ticket)}
        >
          <p className="text-sm font-medium hover:underline">{ticket.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
            {ticket.description}
          </p>
        </button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => (
      <Badge variant={getCategoryVariant(row.original.category)} className="text-xs">
        {ticketCategoryLabels[row.original.category]}
      </Badge>
    ),
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
        {ticketStatusLabels[row.original.status]}
      </span>
    ),
  },
  {
    id: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = (row.original as Ticket).assignee || null;
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
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dibuat
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatRelativeTime(row.original.created_at)}
      </span>
    ),
  },
  ];
}
