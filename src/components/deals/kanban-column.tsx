"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { formatCurrencyCompact } from "@/lib/format";
import type { PipelineStage, Deal } from "@/types";

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  children: React.ReactNode;
}

export function KanbanColumn({ stage, deals, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-card/60 transition-colors",
        isOver && "bg-card border-primary/40"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-sm font-medium">{stage.name}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {deals.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatCurrencyCompact(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 min-h-[100px]">{children}</div>
    </div>
  );
}
