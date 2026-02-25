"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface NoteFormProps {
  onSubmit?: (content: string) => void;
}

export function NoteForm({ onSubmit }: NoteFormProps) {
  const [content, setContent] = useState("");

  function handleSubmit() {
    if (!content.trim()) return;
    onSubmit?.(content.trim());
    toast.success("Catatan berhasil ditambahkan");
    setContent("");
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Tulis catatan..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit} disabled={!content.trim()}>
          <Send className="mr-2 h-3 w-3" />
          Tambah Catatan
        </Button>
      </div>
    </div>
  );
}
