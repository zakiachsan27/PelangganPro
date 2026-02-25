"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { getTicketsColumns } from "@/components/tickets/tickets-columns";
import { TicketsFilter, type TicketsFilterValues } from "@/components/tickets/tickets-filter";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { TicketDetailDialog } from "@/components/tickets/ticket-detail-dialog";
import { TicketForm } from "@/components/tickets/ticket-form";
import { toast } from "sonner";
import type { Ticket } from "@/types";

const ticketStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Menunggu" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function TicketsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketsFilterValues>({
    status: [],
    priority: [],
    assigneeId: [],
    category: [],
  });

  const columns = useMemo(() => getTicketsColumns(setDetailTicket), []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status.length > 0) params.set("status", filters.status.join(","));
      if (filters.priority.length > 0) params.set("priority", filters.priority.join(","));
      if (filters.assigneeId.length > 0) params.set("assignee_id", filters.assigneeId.join(","));
      if (filters.category.length > 0) params.set("category", filters.category.join(","));

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat tickets");
      const json = await res.json();
      setTickets(json.data ?? json);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat tickets");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Kelola dan pantau tiket tim">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Ticket
        </Button>
      </PageHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          searchKey="title"
          searchPlaceholder="Cari ticket..."
          enableRowSelection
          onRowSelectionChange={setSelectedTickets as ((rows: Ticket[]) => void) | undefined}
          toolbar={<TicketsFilter filters={filters} onChange={setFilters} />}
        />
      )}
      <TicketForm open={formOpen} onOpenChange={setFormOpen} onSuccess={fetchTickets} />
      <TicketDetailDialog
        ticket={detailTicket}
        open={!!detailTicket}
        onOpenChange={(open) => { if (!open) setDetailTicket(null); }}
        onUpdated={fetchTickets}
      />
      <BulkActionsBar
        selectedCount={selectedTickets.length}
        onDelete={() => console.log("Delete tickets:", selectedTickets)}
        onChangeStatus={(status) => console.log("Change status:", status, selectedTickets)}
        statusOptions={ticketStatusOptions}
      />
    </div>
  );
}
