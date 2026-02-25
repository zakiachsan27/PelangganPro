"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RfmBadge } from "@/components/segments/rfm-badge";
import { toast } from "sonner";
import type { MessageTemplate, BroadcastChannel } from "@/types";

interface TemplatePickerProps {
  channel: BroadcastChannel;
  onSelect: (template: MessageTemplate) => void;
}

export function TemplatePicker({ channel, onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      try {
        setLoading(true);
        const res = await fetch(`/api/broadcast/templates?channel=${channel}`);
        if (!res.ok) throw new Error("Gagal memuat templates");
        const json = await res.json();
        setTemplates(json.data ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat templates");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1">
          Pilih Template
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                className="w-full rounded-md px-2 py-2 text-left hover:bg-muted transition-colors"
                onClick={() => { onSelect(tmpl); setOpen(false); }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tmpl.name}</span>
                  {tmpl.target_segment !== "all" && (
                    <RfmBadge segment={tmpl.target_segment} className="text-[10px]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {tmpl.body.split("\n")[0]}
                </p>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Tidak ada template untuk channel ini
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
