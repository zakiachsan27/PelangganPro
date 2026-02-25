"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import { contactsColumns } from "./contacts-columns";
import { ContactsFilter, type ContactsFilterValues } from "./contacts-filter";
import type { Contact } from "@/types";

interface ContactsTableProps {
  onSelectionChange?: (rows: Contact[]) => void;
}

export function ContactsTable({ onSelectionChange }: ContactsTableProps) {
  const [filters, setFilters] = useState<ContactsFilterValues>({
    status: null,
    source: null,
    tagId: null,
    ownerId: null,
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.source) params.set("source", filters.source);
      if (filters.ownerId) params.set("owner_id", filters.ownerId);
      params.set("limit", "100");
      const res = await fetch(`/api/contacts?${params}`);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.source, filters.ownerId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <DataTable
      columns={contactsColumns}
      data={contacts}
      searchKey="first_name"
      searchPlaceholder="Cari nama kontak..."
      enableRowSelection
      onRowSelectionChange={onSelectionChange as ((rows: Contact[]) => void) | undefined}
      toolbar={<ContactsFilter filters={filters} onChange={setFilters} />}
    />
  );
}
