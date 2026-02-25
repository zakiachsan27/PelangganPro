"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ContactStatus, ContactSource } from "@/types";

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "customer", label: "Customer" },
  { value: "inactive", label: "Inactive" },
];

const sourceOptions: { value: ContactSource; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "web", label: "Web" },
  { value: "referral", label: "Referral" },
  { value: "tokopedia", label: "Tokopedia" },
  { value: "shopee", label: "Shopee" },
  { value: "import", label: "Import" },
  { value: "manual", label: "Manual" },
];

export interface ContactsFilterValues {
  status: ContactStatus | null;
  source: ContactSource | null;
  tagId: string | null;
  ownerId: string | null;
}

interface ContactsFilterProps {
  filters: ContactsFilterValues;
  onChange: (filters: ContactsFilterValues) => void;
}

export function ContactsFilter({ filters, onChange }: ContactsFilterProps) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((j) => setTags(j.data || j))
      .catch(() => {});

    createSupabaseBrowserClient()
      .from("profiles")
      .select("id, full_name")
      .eq("is_active", true)
      .then(({ data }) => setUsers(data || []));
  }, []);

  const activeCount = [filters.status, filters.source, filters.tagId, filters.ownerId].filter(Boolean).length;

  function clearAll() {
    onChange({ status: null, source: null, tagId: null, ownerId: null });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status || "all"}
        onValueChange={(v) => onChange({ ...filters, status: v === "all" ? null : (v as ContactStatus) })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {statusOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source || "all"}
        onValueChange={(v) => onChange({ ...filters, source: v === "all" ? null : (v as ContactSource) })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Source</SelectItem>
          {sourceOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tagId || "all"}
        onValueChange={(v) => onChange({ ...filters, tagId: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tag</SelectItem>
          {tags.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.ownerId || "all"}
        onValueChange={(v) => onChange({ ...filters, ownerId: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Owner</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearAll}>
          <X className="h-3 w-3" />
          Clear ({activeCount})
        </Button>
      )}
    </div>
  );
}
