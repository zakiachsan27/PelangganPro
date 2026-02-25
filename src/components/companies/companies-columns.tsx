"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import type { Company } from "@/types";

export const companiesColumns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Perusahaan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/companies/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industri",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.industry || "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: "Ukuran",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.size || "-"} orang</span>
    ),
  },
  {
    accessorKey: "city",
    header: "Kota",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.city || "-"}</span>
    ),
  },
  {
    accessorKey: "contact_count",
    header: "Contacts",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.contact_count || 0}
      </span>
    ),
  },
  {
    accessorKey: "deal_count",
    header: "Deals",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.deal_count || 0}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/companies/${row.original.id}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
