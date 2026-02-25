"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactForm } from "@/components/contacts/contact-form";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ExportButton } from "@/components/shared/export-button";
import type { Contact } from "@/types";

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
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Kelola semua kontak bisnis Anda">
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
      </PageHeader>
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
    </div>
  );
}
