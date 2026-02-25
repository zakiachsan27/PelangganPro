"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Deal } from "@/types";

interface CrmDealsSummaryProps {
  contactId: string | null;
}

export function CrmDealsSummary({ contactId }: CrmDealsSummaryProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) {
      setDeals([]);
      return;
    }
    setLoading(true);
    fetch(`/api/deals?contact_id=${contactId}&status=open`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setDeals(json.data || []))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (!contactId) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Active Deals</p>
        <p className="text-xs text-muted-foreground">Tidak ada deal aktif</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Active Deals ({deals.length})
      </p>
      <div className="space-y-2">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={`/deals/${deal.id}`}
            className="block rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium truncate">{deal.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-semibold text-primary">
                {formatCurrency(deal.value)}
              </span>
              {deal.stage && (
                <Badge variant="outline" className="text-xs gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: deal.stage.color }}
                  />
                  {deal.stage.name}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
