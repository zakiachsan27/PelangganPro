"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Pipeline } from "@/types";

interface PipelineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: Pipeline | null;
  onSuccess?: () => void;
}

export function PipelineForm({ open, onOpenChange, pipeline, onSuccess }: PipelineFormProps) {
  const isEdit = !!pipeline;
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const url = isEdit ? `/api/pipelines/${pipeline!.id}` : "/api/pipelines";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Sales Pipeline",
          is_default: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan pipeline");
      }

      toast.success(isEdit ? "Pipeline berhasil diupdate" : "Pipeline berhasil dibuat dengan default stages");
      onOpenChange(false);
      onSuccess?.();
      
      // Force page reload to fetch new pipeline data
      if (!isEdit) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Pipeline form error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pipeline");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pipeline" : "Buat Pipeline Baru"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isEdit 
              ? "Update pipeline yang sudah ada."
              : "Buat pipeline baru dengan nama 'Sales Pipeline' dan default stages."
            }
          </p>

          {!isEdit && (
            <div className="bg-muted rounded-md p-3">
              <p className="text-xs font-medium mb-2">Default Stages yang akan dibuat:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• New Lead</li>
                <li>• Contacted</li>
                <li>• Interested</li>
                <li>• Quotation Sent</li>
                <li>• Deal Won</li>
                <li>• Deal Lost</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Buat Pipeline"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
