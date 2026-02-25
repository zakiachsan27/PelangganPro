"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tags/tag-badge";
import { getInitials, formatCurrency, formatDate } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import type { Contact } from "@/types";

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  web: "Web",
  referral: "Referral",
  tokopedia: "Tokopedia",
  shopee: "Shopee",
  import: "Import",
  manual: "Manual",
};

const statusColors: Record<string, string> = {
  lead: "bg-warning/15 text-warning-foreground",
  active: "bg-primary/10 text-primary",
  inactive: "bg-secondary text-secondary-foreground",
  customer: "bg-success/15 text-success-foreground",
};

export const contactsColumns: ColumnDef<Contact>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const contact = row.original;
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
      return (
        <Link
          href={`/contacts/${contact.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{fullName}</p>
            {contact.email && (
              <p className="text-xs text-muted-foreground">{contact.email}</p>
            )}
          </div>
        </Link>
      );
    },
    filterFn: (row, _id, value: string) => {
      const contact = row.original;
      const fullName = `${contact.first_name} ${contact.last_name || ""}`.toLowerCase();
      return fullName.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.phone || "-"}</span>
    ),
  },
  {
    accessorKey: "company_id",
    header: "Perusahaan",
    cell: ({ row }) => {
      const company = row.original.company;
      return company ? (
        <Link
          href={`/companies/${company.id}`}
          className="text-sm hover:underline"
        >
          {company.name}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          statusColors[row.original.status] || ""
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.source ? sourceLabels[row.original.source] || row.original.source : "-"}
      </Badge>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || [];
      if (tags.length === 0) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{tags.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lifetime_value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lifetime Value
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.lifetime_value > 0
          ? formatCurrency(row.original.lifetime_value)
          : "-"}
      </span>
    ),
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
            <AvatarFallback className="text-xs">
              {getInitials(owner.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{owner.full_name.split(" ")[0]}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/contacts/${row.original.id}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
