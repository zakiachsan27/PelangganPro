"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactSource } from "@/types";

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

export interface LeadsFilterValues {
  search: string;
  source: ContactSource | null;
  tagId: string | null;
}

interface LeadsFilterProps {
  filters: LeadsFilterValues;
  onChange: (filters: LeadsFilterValues) => void;
}

export function LeadsFilter({ filters, onChange }: LeadsFilterProps) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((j) => setTags(j.data || j))
      .catch(() => {});
  }, []);

  const activeCount = [filters.source, filters.tagId].filter(Boolean).length;

  function clearAll() {
    onChange({ search: "", source: null, tagId: null });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari lead..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-8 h-8 text-xs"
        />
      </div>

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

      {(activeCount > 0 || filters.search) && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearAll}>
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
