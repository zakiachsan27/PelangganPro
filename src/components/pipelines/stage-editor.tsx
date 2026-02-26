"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GripVertical, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/types";

const PRESET_COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#6b7280",
];

interface StageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  pipelineId: string;
  pipelineName: string;
  onSuccess?: () => void;
}

// Default stages template
const DEFAULT_STAGES = [
  { name: "New Lead", color: "#3b82f6", is_won: false, is_lost: false },
  { name: "Contacted", color: "#8b5cf6", is_won: false, is_lost: false },
  { name: "Interested", color: "#f59e0b", is_won: false, is_lost: false },
  { name: "Quotation Sent", color: "#10b981", is_won: false, is_lost: false },
  { name: "Deal Won", color: "#22c55e", is_won: true, is_lost: false },
  { name: "Deal Lost", color: "#ef4444", is_won: false, is_lost: true },
];

export function StageEditor({ open, onOpenChange, stages: initialStages, pipelineId, pipelineName, onSuccess }: StageEditorProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);

  // Update stages when dialog opens or initialStages changes
  useEffect(() => {
    if (open) {
      if (initialStages.length === 0) {
        // Create from default template
        setStages(DEFAULT_STAGES.map((s, i) => ({
          id: `stage-new-${Date.now()}-${i}`,
          pipeline_id: pipelineId,
          name: s.name,
          position: i + 1,
          color: s.color,
          is_won: s.is_won,
          is_lost: s.is_lost,
          created_at: new Date().toISOString(),
        })));
      } else {
        setStages(initialStages);
      }
    }
  }, [open, initialStages, pipelineId]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  function updateStage(id: string, updates: Partial<PipelineStage>) {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function deleteStage(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id));
  }

  function addStage() {
    const newStage: PipelineStage = {
      id: `stage-new-${Date.now()}`,
      pipeline_id: pipelineId,
      name: "",
      position: stages.length + 1,
      color: PRESET_COLORS[stages.length % PRESET_COLORS.length],
      is_won: false,
      is_lost: false,
      created_at: new Date().toISOString(),
    };
    setStages((prev) => [...prev, newStage]);
  }

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      setStages((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIdx, 1);
        updated.splice(overIdx, 0, moved);
        return updated.map((s, i) => ({ ...s, position: i + 1 }));
      });
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx]);

  async function handleSave() {
    const emptyNames = stages.filter((s) => !s.name.trim());
    if (emptyNames.length > 0) {
      toast.error("Semua stage harus memiliki nama");
      return;
    }

    setLoading(true);
    try {
      console.log("[StageEditor] Saving stages:", stages);
      const res = await fetch(`/api/pipelines/${pipelineId}/stages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages }),
      });

      console.log("[StageEditor] Response status:", res.status);
      
      if (!res.ok) {
        const err = await res.json();
        console.error("[StageEditor] Error response:", err);
        throw new Error(err.error || "Gagal menyimpan stages");
      }

      const data = await res.json();
      console.log("[StageEditor] Success:", data);
      toast.success("Stages berhasil disimpan");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Stage editor error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan stages");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stages - {pipelineName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              ref={dragIdx === idx ? dragNodeRef : undefined}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2 transition-all",
                dragIdx === idx && "opacity-40",
                overIdx === idx && dragIdx !== null && dragIdx !== idx && "border-primary border-dashed"
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />

              <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}</span>

              {/* Color picker */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) => updateStage(stage.id, { color: e.target.value })}
                  className="h-6 w-6 cursor-pointer rounded border-0 p-0"
                />
              </div>

              <Input
                value={stage.name}
                onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                placeholder="Nama stage"
                className="h-7 text-xs flex-1"
              />

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <Switch
                    checked={stage.is_won}
                    onCheckedChange={(v) => updateStage(stage.id, { is_won: v, is_lost: v ? false : stage.is_lost })}
                    className="h-4 w-7"
                  />
                  <Label className="text-xs text-success-foreground">Won</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={stage.is_lost}
                    onCheckedChange={(v) => updateStage(stage.id, { is_lost: v, is_won: v ? false : stage.is_won })}
                    className="h-4 w-7"
                  />
                  <Label className="text-xs text-destructive">Lost</Label>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteStage(stage.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full gap-1" onClick={addStage}>
          <Plus className="h-3 w-3" />
          Tambah Stage
        </Button>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
