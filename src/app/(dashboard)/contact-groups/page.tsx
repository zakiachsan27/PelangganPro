"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ContactGroupsList } from "@/components/contact-groups/contact-groups-list";
import { ContactGroupForm } from "@/components/contact-groups/contact-group-form";
import type { ContactGroup } from "@/types";

export default function ContactGroupsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (group: ContactGroup) => {
    setEditingGroup(group);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingGroup(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingGroup(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Grup Kontak" description="Kelompokkan kontak untuk memudahkan pengiriman pesan">
        <div className="flex items-center gap-2">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Grup
          </Button>
        </div>
      </PageHeader>
      <ContactGroupsList key={refreshKey} onEdit={handleEdit} />
      <ContactGroupForm
        open={formOpen}
        onOpenChange={handleFormClose}
        group={editingGroup}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
