"use client";

import { useState, useEffect, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { formatRelativeTime, getInitials } from "@/lib/format";
import { toast } from "sonner";
import type { Activity } from "@/types";

const actionLabels: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  stage_changed: "Stage Changed",
  note_added: "Note Added",
  won: "Won",
  lost: "Lost",
  converted: "Converted",
  assigned: "Assigned",
  tagged: "Tagged",
};

const actionColors: Record<string, string> = {
  created: "bg-primary/10 text-primary",
  updated: "bg-secondary text-secondary-foreground",
  stage_changed: "bg-accent text-accent-foreground",
  note_added: "bg-warning/15 text-warning-foreground",
  won: "bg-success/15 text-success-foreground",
  lost: "bg-destructive/10 text-destructive",
  converted: "bg-success/15 text-success-foreground",
  assigned: "bg-primary/10 text-primary",
  tagged: "bg-warning/15 text-warning-foreground",
};

const activityColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "created_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[row.original.action] || ""}`}>
        {actionLabels[row.original.action] || row.original.action}
      </span>
    ),
  },
  {
    accessorKey: "entity_type",
    header: "Entitas",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs capitalize">
        {row.original.entity_type}
      </Badge>
    ),
  },
  {
    id: "actor",
    header: "Aktor",
    cell: ({ row }) => {
      const actor = row.original.actor || null;
      if (!actor) return <span className="text-xs text-muted-foreground">System</span>;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px]">{getInitials(actor.full_name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{actor.full_name}</span>
        </div>
      );
    },
  },
  {
    id: "details",
    header: "Detail",
    cell: ({ row }) => {
      const details = row.original.details as Record<string, string>;
      if (!details || Object.keys(details).length === 0) return <span className="text-xs text-muted-foreground">-</span>;

      const preview = Object.entries(details)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {preview}
        </span>
      );
    },
  },
];

const entityTypes: { value: string; label: string }[] = [
  { value: "contact", label: "Contact" },
  { value: "deal", label: "Deal" },
  { value: "company", label: "Company" },
  { value: "task", label: "Task" },
];

const actionTypes: { value: string; label: string }[] = [
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "stage_changed", label: "Stage Changed" },
  { value: "note_added", label: "Note Added" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function ActivityPage() {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== "all") params.set("entity_type", entityFilter);
      if (actionFilter !== "all") params.set("action", actionFilter);

      const res = await fetch(`/api/activities?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat aktivitas");
      const json = await res.json();
      setActivities(json.data ?? json);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat aktivitas");
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Semua aktivitas yang terjadi di sistem"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={activityColumns}
          data={activities}
          toolbar={
            <div className="flex items-center gap-2">
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Entity</SelectItem>
                  {entityTypes.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Action</SelectItem>
                  {actionTypes.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}
    </div>
  );
}
