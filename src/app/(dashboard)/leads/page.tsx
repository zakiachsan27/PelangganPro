"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { TagBadge } from "@/components/tags/tag-badge";
import { LeadsFilter, type LeadsFilterValues } from "@/components/leads/leads-filter";
import { getInitials, formatRelativeTime } from "@/lib/format";
import type { Contact, Deal, PipelineStage } from "@/types";

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  web: "Web",
  referral: "Referral",
  tokopedia: "Tokopedia",
  shopee: "Shopee",
};

// Component untuk menampilkan stage badge untuk setiap lead
function LeadStageBadge({ contactId }: { contactId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals?contact_id=${contactId}&limit=1`);
        if (res.ok) {
          const json = await res.json();
          const deals = json.data || [];
          if (deals.length > 0) {
            setDeal(deals[0]);
          }
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [contactId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!deal || !deal.stage) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FolderKanban className="h-3 w-3" />
        <span>No pipeline</span>
      </div>
    );
  }

  return (
    <Link href={`/deals/${deal.id}`} className="inline-flex items-center gap-1.5 text-xs hover:underline">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: deal.stage.color }}
      />
      <span className="font-medium" style={{ color: deal.stage.color }}>
        {deal.stage.name}
      </span>
    </Link>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<LeadsFilterValues>({
    search: "",
    source: null,
    tagId: null,
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "lead", limit: "100" });
      if (filters.search) params.set("search", filters.search);
      if (filters.source) params.set("source", filters.source);
      const res = await fetch(`/api/contacts?${params}`);
      if (res.ok) {
        const json = await res.json();
        setLeads(json.data || []);
        setTotal(json.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.source]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);



  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${total} leads aktif menunggu konversi`}
      />

      <LeadsFilter filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Memuat leads...</span>
        </div>
      ) : leads.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const fullName = `${lead.first_name} ${lead.last_name || ""}`.trim();

            return (
              <Card key={lead.id} className="group hover:bg-muted/50 transition-colors duration-200">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/contacts/${lead.id}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {lead.email || lead.phone || "-"}
                        </p>
                      </div>
                    </div>
                    {lead.source && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {sourceLabels[lead.source] || lead.source}
                      </Badge>
                    )}
                  </div>

                  {/* Pipeline Stage Badge */}
                  <div className="mt-3">
                    <LeadStageBadge contactId={lead.id} />
                  </div>

                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {lead.tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(lead.created_at)}
                      {lead.owner && (
                        <span className="ml-2">
                          &middot; {lead.owner.full_name.split(" ")[0]}
                        </span>
                      )}
                    </div>
                    {lead.status === "lead" && (
                      <Link href={`/deals/new?contact_id=${lead.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Convert to Deal
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Tidak ada leads yang cocok dengan filter.
          </p>
        </div>
      )}
    </div>
  );
}
