"use client";

import { useState, useEffect } from "react";
import { SegmentDetailHeader } from "./segment-detail-header";
import { SegmentCustomerTable } from "./segment-customer-table";
import type { RfmSegmentInfo, ContactRfm, Contact } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SegmentDetailProps {
  segment: RfmSegmentInfo;
}

export function SegmentDetail({ segment }: SegmentDetailProps) {
  const [customers, setCustomers] = useState<(Contact & { rfm: ContactRfm })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/segments/${segment.key}`);
        if (!res.ok) throw new Error("Gagal memuat data pelanggan");
        const json = await res.json();
        // API returns { data: (ContactRfm & { contact: Contact })[] }
        // Transform to (Contact & { rfm: ContactRfm })[] for SegmentCustomerTable
        const mapped = (json.data ?? []).map((row: ContactRfm & { contact: Contact }) => ({
          ...row.contact,
          rfm: {
            contact_id: row.contact_id,
            segment: row.segment,
            scores: row.scores,
            total_purchases: row.total_purchases,
            last_purchase_date: row.last_purchase_date,
            total_spent: row.total_spent,
            avg_order_value: row.avg_order_value,
          },
        }));
        setCustomers(mapped);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat data pelanggan");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [segment.key]);

  return (
    <div className="space-y-6">
      <SegmentDetailHeader segment={segment} />
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <SegmentCustomerTable customers={customers} />
      )}
    </div>
  );
}
