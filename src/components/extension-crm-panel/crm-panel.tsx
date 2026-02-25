"use client";

import { Separator } from "@/components/ui/separator";
import { CrmContactCard } from "./crm-contact-card";
import { CrmDealsSummary } from "./crm-deals-summary";
import { CrmQuickActions } from "./crm-quick-actions";

interface CrmPanelProps {
  contactId: string | null;
}

export function CrmPanel({ contactId }: CrmPanelProps) {
  return (
    <div className="h-full flex flex-col border-l">
      <div className="px-4 py-3 border-b">
        <p className="text-sm font-semibold">CRM</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <CrmContactCard contactId={contactId} />
        <Separator />
        <CrmDealsSummary contactId={contactId} />
        <Separator />
        <CrmQuickActions contactId={contactId ?? undefined} />
      </div>
    </div>
  );
}
