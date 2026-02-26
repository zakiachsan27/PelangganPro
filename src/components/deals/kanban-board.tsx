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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
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
  const [wonLostDialogOpen, setWonLostDialogOpen] = useState(false);
  const [wonLostFilter, setWonLostFilter] = useState<"won" | "lost" | null>(null);

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

  // Show message if no stages
  if (kanbanStages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground mb-4">
          Pipeline ini belum memiliki stages.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Klik tombol di bawah untuk membuat default stages.
        </p>
      </div>
    );
  }

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

  function handleOpenWonLostDialog(type: "won" | "lost") {
    setWonLostFilter(type);
    setWonLostDialogOpen(true);
  }

  function handleStageChange(dealId: string, stageId: string, status?: "won" | "lost") {
    const targetStage = stages.find((s) => s.id === stageId);

    // Optimistic update - keep all deals in state
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: stageId, ...(status && { status }) } : d))
    );
    
    if (selectedDeal?.id === dealId) {
      setSelectedDeal({ 
        ...selectedDeal, 
        stage_id: stageId,
        ...(status && { status }),
      });
    }

    // Notify parent
    onDealMoved?.(dealId, stageId);

    // Persist to API (fire-and-forget)
    const body: Record<string, unknown> = { stage_id: stageId };
    if (status) body.status = status;
    if ((targetStage?.is_won || targetStage?.is_lost) && !status) {
      body.status = targetStage.is_won ? "won" : "lost";
    }
    // Set actual_close_date if moved to won/lost stage
    if (targetStage?.is_won || targetStage?.is_lost) {
      body.actual_close_date = new Date().toISOString().split("T")[0];
    }
    
    fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
              className="flex items-center justify-between rounded-lg border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              style={{ borderLeftColor: stage.color, borderLeftWidth: 4 }}
              onClick={() => handleOpenWonLostDialog(stage.is_won ? "won" : "lost")}
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
        onDealUpdated={(updatedDeal) => {
          // Update deal in state
          setDeals((prev) =>
            prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))
          );
          setSelectedDeal(updatedDeal);
        }}
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

      {/* Won/Lost Deals Dialog */}
      <Dialog open={wonLostDialogOpen} onOpenChange={setWonLostDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {wonLostFilter === "won" ? "Deal Won" : "Deal Lost"}
              {(() => {
                const filteredDeals = wonLostFilter === "won" 
                  ? deals.filter((d) => stages.find((s) => s.id === d.stage_id)?.is_won)
                  : deals.filter((d) => stages.find((s) => s.id === d.stage_id)?.is_lost);
                return ` (${filteredDeals.length})`;
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {(() => {
              const targetStage = wonLostFilter === "won"
                ? stages.find((s) => s.is_won)
                : stages.find((s) => s.is_lost);
              const filteredDeals = targetStage 
                ? deals.filter((d) => d.stage_id === targetStage.id)
                : [];
              
              if (filteredDeals.length === 0) {
                return (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada deal
                  </p>
                );
              }
              
              return filteredDeals.map((deal) => {
                const contact = deal.contact;
                const contactName = contact
                  ? `${contact.first_name} ${contact.last_name || ""}`.trim()
                  : "-";
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setWonLostDialogOpen(false);
                      handleCardClick(deal);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(contactName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {contactName} · {formatDate(deal.actual_close_date || deal.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
