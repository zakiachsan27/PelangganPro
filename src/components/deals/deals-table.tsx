"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import type { Deal } from "@/types";

const statusLabels: Record<string, string> = {
  open: "Open",
  won: "Menang",
  lost: "Kalah",
};

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  won: "bg-success/15 text-success-foreground",
  lost: "bg-destructive/10 text-destructive",
};

const dealsColumns: ColumnDef<Deal>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Deal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/deals/${row.original.id}`} className="font-medium text-sm hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nilai
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{formatCurrency(row.original.value)}</span>
    ),
  },
  {
    id: "stage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.original.stage;
      return stage ? (
        <Badge variant="outline" className="gap-1 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
          {stage.name}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
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
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.original.contact;
      return contact ? (
        <Link href={`/contacts/${contact.id}`} className="text-sm hover:underline">
          {contact.first_name} {contact.last_name || ""}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "company",
    header: "Company",
    cell: ({ row }) => {
      const company = row.original.company;
      return company ? (
        <Link href={`/companies/${company.id}`} className="text-sm hover:underline">
          {company.name}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{getInitials(owner.full_name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{owner.full_name.split(" ")[0]}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "expected_close_date",
    header: "Close Date",
    cell: ({ row }) =>
      row.original.expected_close_date ? (
        <span className="text-sm">{formatDate(row.original.expected_close_date)}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/deals/${row.original.id}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];

interface DealsTableProps {
  data: Deal[];
}

export function DealsTable({ data }: DealsTableProps) {
  return (
    <DataTable
      columns={dealsColumns}
      data={data}
      searchKey="title"
      searchPlaceholder="Cari deal..."
    />
  );
}
