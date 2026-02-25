"use client";

import { useEffect, useState, useMemo } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { WaQuickReply } from "@/types";

interface QuickReplyPickerProps {
  onSelect: (body: string) => void;
}

export function QuickReplyPicker({ onSelect }: QuickReplyPickerProps) {
  const [replies, setReplies] = useState<WaQuickReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/wa/quick-replies")
      .then((res) => res.json())
      .then((data) => setReplies(Array.isArray(data) ? data : []))
      .catch(() => setReplies([]))
      .finally(() => setLoading(false));
  }, [open]);

  // Group by category
  const grouped = useMemo(
    () =>
      replies.reduce<Record<string, WaQuickReply[]>>((acc, qr) => {
        if (!acc[qr.category]) acc[qr.category] = [];
        acc[qr.category].push(qr);
        return acc;
      }, {}),
    [replies]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">Quick Reply</p>
          <p className="text-xs text-muted-foreground">Pilih template untuk disisipkan ke pesan</p>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada quick reply
            </p>
          ) : (
            Object.entries(grouped).map(([category, catReplies]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">{category}</p>
                {catReplies.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => {
                      onSelect(qr.body);
                      setOpen(false);
                    }}
                    className="w-full text-left rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium">{qr.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{qr.body}</p>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
