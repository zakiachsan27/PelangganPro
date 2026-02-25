"use client";

import { useState, useEffect } from "react";
import { Trash2, UserPlus, Tag, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onAssignOwner?: (ownerId: string) => void;
  onAddTag?: (tagId: string) => void;
  onChangeStatus?: (status: string) => void;
  statusOptions?: { value: string; label: string }[];
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onAssignOwner,
  onAddTag,
  onChangeStatus,
  statusOptions,
}: BulkActionsBarProps) {
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

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-background/95 backdrop-blur-lg px-5 py-3 shadow-lg">
      <span className="text-sm font-medium whitespace-nowrap">
        {selectedCount} dipilih
      </span>

      <div className="h-4 w-px bg-border" />

      {onAssignOwner && (
        <Select onValueChange={(v) => {
          onAssignOwner(v);
          toast.success(`Owner berhasil diubah untuk ${selectedCount} item`);
        }}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <UserPlus className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Assign Owner" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onAddTag && (
        <Select onValueChange={(v) => {
          onAddTag(v);
          toast.success(`Tag berhasil ditambahkan ke ${selectedCount} item`);
        }}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <Tag className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Add Tag" />
          </SelectTrigger>
          <SelectContent>
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
      )}

      {onChangeStatus && statusOptions && (
        <Select onValueChange={(v) => {
          onChangeStatus(v);
          toast.success(`Status berhasil diubah untuk ${selectedCount} item`);
        }}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <ArrowRightLeft className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Ubah Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            onDelete();
            toast.success(`${selectedCount} item berhasil dihapus`);
          }}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Hapus
        </Button>
      )}
    </div>
  );
}
