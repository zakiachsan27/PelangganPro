"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LayoutGrid, List, Settings2, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { DealsTable } from "@/components/deals/deals-table";
import { DealForm } from "@/components/deals/deal-form";
import { PipelineForm } from "@/components/pipelines/pipeline-form";
import { StageEditor } from "@/components/pipelines/stage-editor";
import { formatCurrencyCompact } from "@/lib/format";
import { toast } from "sonner";
import type { Pipeline, PipelineStage, Deal } from "@/types";

export default function DealsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [editPipelineOpen, setEditPipelineOpen] = useState(false);
  const [stageEditorOpen, setStageEditorOpen] = useState(false);

  // Real data state
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch pipelines and find default
      const pipelinesRes = await fetch("/api/pipelines");
      if (!pipelinesRes.ok) throw new Error("Gagal memuat pipeline");
      const pipelines: Pipeline[] = await pipelinesRes.json();

      const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0] || null;
      setPipeline(defaultPipeline);

      if (!defaultPipeline) {
        setStages([]);
        setDeals([]);
        setLoading(false);
        return;
      }

      setStages(defaultPipeline.stages || []);

      // 2. Fetch deals for this pipeline
      const dealsRes = await fetch(
        `/api/deals?pipeline_id=${defaultPipeline.id}&limit=100`
      );
      if (!dealsRes.ok) throw new Error("Gagal memuat deals");
      const dealsJson = await dealsRes.json();
      setDeals(dealsJson.data || []);
    } catch (err) {
      console.error("Failed to load deals page data:", err);
      toast.error("Gagal memuat data deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="space-y-6">
        <PageHeader title="Deals & Pipeline" description="Pipeline penjualan dan kelola tahapan" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              Belum ada pipeline. Buat pipeline pertama untuk mulai mengelola deals.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Pipeline" description="Pipeline penjualan dan kelola tahapan">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Deal
        </Button>
      </PageHeader>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="stages">Kelola Stage</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border bg-card">
              <Button
                variant={view === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-r-none"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-l-none"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {view === "kanban" ? (
            <KanbanBoard
              pipeline={pipeline}
              stages={stages}
              initialDeals={deals}
              onDealMoved={(dealId, stageId) => {
                // Update local state to keep in sync
                setDeals((prev) =>
                  prev.map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d))
                );
              }}
            />
          ) : (
            <DealsTable data={deals} />
          )}
        </TabsContent>

        <TabsContent value="stages" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>{pipeline.name}</CardTitle>
                  {pipeline.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setStageEditorOpen(true)}>
                    <Settings2 className="h-3.5 w-3.5" />
                    Edit Stages
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setEditPipelineOpen(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-destructive hover:text-destructive"
                    onClick={() => toast.error("Pipeline default tidak dapat dihapus")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stages.map((stage) => {
                  const stageDeals = deals.filter((d) => d.stage_id === stage.id);
                  const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                  return (
                    <div
                      key={stage.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                        {stage.position}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {stage.name}
                      </span>
                      {stage.is_won && (
                        <Badge className="bg-success/15 text-success-foreground">Won</Badge>
                      )}
                      {stage.is_lost && (
                        <Badge className="bg-destructive/10 text-destructive">Lost</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {stageDeals.length} deals &middot;{" "}
                        {formatCurrencyCompact(totalValue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DealForm open={formOpen} onOpenChange={setFormOpen} onSuccess={fetchData} />
      <PipelineForm open={editPipelineOpen} onOpenChange={setEditPipelineOpen} pipeline={pipeline} />
      <StageEditor
        open={stageEditorOpen}
        onOpenChange={setStageEditorOpen}
        stages={stages}
        pipelineName={pipeline.name}
      />
    </div>
  );
}
