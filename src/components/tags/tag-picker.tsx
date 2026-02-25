"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/types";

interface TagPickerProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#14b8a6", "#6b7280", "#ec4899", "#0ea5e9",
];

export function TagPicker({ selectedTagIds, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [localTags, setLocalTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((j) => setTags(j.data || j))
      .catch(() => {});

    function setTags(data: Tag[]) {
      setLocalTags(data);
    }
  }, []);

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  }

  function removeTag(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  function createTag() {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: `tag-new-${Date.now()}`,
      org_id: "org-001",
      name: newTagName.trim(),
      color: newTagColor,
      created_at: new Date().toISOString(),
    };
    setLocalTags([...localTags, newTag]);
    onChange([...selectedTagIds, newTag.id]);
    setNewTagName("");
    setShowCreate(false);
  }

  const selectedTags = localTags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="hover:opacity-75"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <ChevronsUpDown className="mr-1 h-3 w-3" />
            Pilih Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          {showCreate ? (
            <div className="p-3 space-y-3">
              <Input
                placeholder="Nama tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-5 w-5 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: newTagColor === color ? "black" : "transparent",
                      transform: newTagColor === color ? "scale(1.2)" : "scale(1)",
                    }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={createTag} disabled={!newTagName.trim()}>
                  Buat
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="Cari tag..." />
              <CommandList>
                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {localTags.map((tag) => (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => toggleTag(tag.id)}>
                      <span className="mr-2 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="flex-1">{tag.name}</span>
                      {selectedTagIds.includes(tag.id) && <Check className="h-3 w-3" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-3 w-3" />
                    Buat tag baru
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
