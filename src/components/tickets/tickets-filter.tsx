"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TicketStatus, TicketPriority, TicketCategory } from "@/types";

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Menunggu" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const categoryOptions: { value: TicketCategory; label: string }[] = [
  { value: "bug", label: "Bug/Error" },
  { value: "feature_request", label: "Feature Request" },
  { value: "pertanyaan", label: "Pertanyaan" },
  { value: "keluhan_pelanggan", label: "Keluhan Pelanggan" },
  { value: "internal", label: "Internal" },
];

export interface TicketsFilterValues {
  status: TicketStatus[];
  priority: TicketPriority[];
  assigneeId: string[];
  category: TicketCategory[];
}

interface TicketsFilterProps {
  filters: TicketsFilterValues;
  onChange: (filters: TicketsFilterValues) => void;
}

function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  function toggle(value: T) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-normal">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px] rounded-full">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-0.5">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-muted/50 rounded text-sm"
            >
              <Checkbox
                checked={selected.includes(opt.value)}
                onCheckedChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TicketsFilter({ filters, onChange }: TicketsFilterProps) {
  const [assigneeOptions, setAssigneeOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("is_active", true)
          .order("full_name");
        if (data) {
          setAssigneeOptions(data.map((u) => ({ value: u.id, label: u.full_name })));
        }
      } catch {
        // Silently fail
      }
    }
    fetchUsers();
  }, []);

  const activeCount =
    filters.status.length + filters.priority.length + filters.assigneeId.length + filters.category.length;

  function clearAll() {
    onChange({ status: [], priority: [], assigneeId: [], category: [] });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelectFilter
        label="Status"
        options={statusOptions}
        selected={filters.status}
        onChange={(v) => onChange({ ...filters, status: v })}
      />
      <MultiSelectFilter
        label="Priority"
        options={priorityOptions}
        selected={filters.priority}
        onChange={(v) => onChange({ ...filters, priority: v })}
      />
      <MultiSelectFilter
        label="Kategori"
        options={categoryOptions}
        selected={filters.category}
        onChange={(v) => onChange({ ...filters, category: v })}
      />
      <MultiSelectFilter
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assigneeId}
        onChange={(v) => onChange({ ...filters, assigneeId: v })}
      />

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearAll}>
          <X className="h-3 w-3" />
          Clear ({activeCount})
        </Button>
      )}
    </div>
  );
}
