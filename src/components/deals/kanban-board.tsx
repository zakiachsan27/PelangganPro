"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { DealDetailSidebar } from "./deal-detail-sidebar";
import { DealForm } from "./deal-form";
import type { Deal, Pipeline, PipelineStage } from "@/types";

interface KanbanBoardProps {
  pipeline: Pipeline;
  stages: PipelineStage[];
  initialDeals: Deal[];
  onDealMoved?: (dealId: string, stageId: string) => void;
}

export function KanbanBoard({ pipeline, stages, initialDeals, onDealMoved }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddStageId, setQuickAddStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  // Only show open stages in kanban (not won/lost)
  const kanbanStages = stages.filter((s) => !s.is_won && !s.is_lost);
  const wonLostStages = stages.filter((s) => s.is_won || s.is_lost);

  function getDealsForStage(stageId: string) {
    return deals
      .filter((d) => d.stage_id === stageId)
      .sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Determine the target stage
    let targetStageId: string;

    // If dropped on a stage column
    if (overId.startsWith("stage-")) {
      targetStageId = overId;
    } else {
      // Dropped on another deal - find its stage
      const overDeal = deals.find((d) => d.id === overId);
      if (!overDeal) return;
      targetStageId = overDeal.stage_id;
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage_id: targetStageId } : d
      )
    );

    // Notify parent
    onDealMoved?.(dealId, targetStageId);

    // Persist to API (fire-and-forget)
    fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: targetStageId }),
    }).catch((err) => {
      console.error("Failed to persist deal stage change:", err);
    });
  }

  function handleCardClick(deal: Deal) {
    setSelectedDeal(deal);
    setSidebarOpen(true);
  }

  function handleStageChange(dealId: string, stageId: string) {
    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d))
    );
    if (selectedDeal?.id === dealId) {
      setSelectedDeal({ ...selectedDeal, stage_id: stageId });
    }

    // Notify parent
    onDealMoved?.(dealId, stageId);

    // Persist to API (fire-and-forget)
    fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stageId }),
    }).catch((err) => {
      console.error("Failed to persist deal stage change:", err);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Pipeline: {pipeline.name}
        </h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStages.map((stage) => {
            const stageDeals = getDealsForStage(stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
              >
                <SortableContext
                  items={stageDeals.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {stageDeals.map((deal) => (
                    <KanbanCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => handleCardClick(deal)}
                    />
                  ))}
                </SortableContext>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setQuickAddStageId(stage.id)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Tambah Deal
                </Button>
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && <KanbanCard deal={activeDeal} isOverlay />}
        </DragOverlay>
      </DndContext>

      {/* Won/Lost summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {wonLostStages.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          const totalValue = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div
              key={stage.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4"
              style={{ borderLeftColor: stage.color, borderLeftWidth: 4 }}
            >
              <div>
                <p className="font-medium">{stage.name}</p>
                <p className="text-sm text-muted-foreground">
                  {stageDeals.length} deals
                </p>
              </div>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalValue)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      <DealDetailSidebar
        deal={selectedDeal}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onStageChange={handleStageChange}
        stages={stages}
      />

      {/* Quick Add Deal Form */}
      {quickAddStageId && (
        <DealForm
          open={!!quickAddStageId}
          onOpenChange={() => setQuickAddStageId(null)}
          defaultStageId={quickAddStageId}
        />
      )}
    </div>
  );
}
