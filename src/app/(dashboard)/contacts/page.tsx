"use client";

import { useState } from "react";
import { Plus, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactGroupsList } from "@/components/contact-groups/contact-groups-list";
import { ContactGroupForm } from "@/components/contact-groups/contact-group-form";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contact, ContactGroup } from "@/types";

const contactExportColumns = [
  { key: "first_name", label: "Nama Depan" },
  { key: "last_name", label: "Nama Belakang" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telepon" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source" },
];

const contactImportColumns = [
  "Nama Depan", "Nama Belakang", "Email", "Telepon", "WhatsApp", "Status", "Source",
];

const contactStatusOptions = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "customer", label: "Customer" },
  { value: "inactive", label: "Inactive" },
];

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [formOpen, setFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGroupSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingGroup(null);
  };

  const handleGroupEdit = (group: ContactGroup) => {
    setEditingGroup(group);
    setGroupFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PageHeader 
          title="Contacts" 
          description={activeTab === "contacts" ? "Kelola semua kontak bisnis Anda" : "Kelompokkan kontak untuk memudahkan pengiriman pesan"}
        >
          {activeTab === "contacts" ? (
            <div className="flex items-center gap-2">
              <ExportButton
                data={[] as Record<string, unknown>[]}
                filename="contacts"
                columns={contactExportColumns}
              />
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setImportOpen(true)}>
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Contact
              </Button>
            </div>
          ) : (
            <Button onClick={() => setGroupFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Grup
            </Button>
          )}
        </PageHeader>

        <TabsList className="mb-6">
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Grup Kontak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-0">
          <ContactsTable onSelectionChange={setSelectedContacts} />
          <ContactForm open={formOpen} onOpenChange={setFormOpen} />
          <ImportDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            entityName="Contacts"
            expectedColumns={contactImportColumns}
          />
          <BulkActionsBar
            selectedCount={selectedContacts.length}
            onDelete={() => console.log("Delete contacts:", selectedContacts)}
            onAssignOwner={(ownerId) => console.log("Assign owner:", ownerId, selectedContacts)}
            onAddTag={(tagId) => console.log("Add tag:", tagId, selectedContacts)}
            onChangeStatus={(status) => console.log("Change status:", status, selectedContacts)}
            statusOptions={contactStatusOptions}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-0">
          <ContactGroupsList 
            key={refreshKey}
            onEdit={handleGroupEdit} 
          />
          <ContactGroupForm
            open={groupFormOpen}
            onOpenChange={(open) => {
              setGroupFormOpen(open);
              if (!open) setEditingGroup(null);
            }}
            group={editingGroup}
            onSuccess={handleGroupSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
