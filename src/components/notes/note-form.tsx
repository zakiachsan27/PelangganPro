"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface NoteFormProps {
  contactId?: string;
  dealId?: string;
  companyId?: string;
  onSubmit?: () => void;
}

export function NoteForm({ contactId, dealId, companyId, onSubmit }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim() || isSubmitting) return;
    if (!contactId && !dealId && !companyId) {
      toast.error("Target entity is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, string> = {
        content: content.trim(),
      };
      if (contactId) body.contact_id = contactId;
      if (dealId) body.deal_id = dealId;
      if (companyId) body.company_id = companyId;

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Catatan berhasil ditambahkan");
        setContent("");
        onSubmit?.();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal menambahkan catatan");
      }
    } catch {
      toast.error("Gagal menambahkan catatan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Tulis catatan..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button 
          size="sm" 
          onClick={handleSubmit} 
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Send className="mr-2 h-3 w-3" />
          )}
          {isSubmitting ? "Menyimpan..." : "Tambah Catatan"}
        </Button>
      </div>
    </div>
  );
}
