"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { tasksColumns } from "@/components/tasks/tasks-columns";
import { TasksFilter, type TasksFilterValues } from "@/components/tasks/tasks-filter";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { TaskForm } from "@/components/tasks/task-form";
import type { Task } from "@/types";

const taskStatusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TasksPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TasksFilterValues>({
    status: null,
    priority: null,
    assigneeId: null,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.assigneeId) params.set("assignee_id", filters.assigneeId);
      const res = await fetch(`/api/tasks?${params}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.assigneeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Kelola semua tugas tim Anda">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Task
        </Button>
      </PageHeader>
      <DataTable
        columns={tasksColumns}
        data={tasks}
        searchKey="title"
        searchPlaceholder="Cari task..."
        enableRowSelection
        onRowSelectionChange={setSelectedTasks as ((rows: Task[]) => void) | undefined}
        toolbar={<TasksFilter filters={filters} onChange={setFilters} />}
      />
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchTasks}
      />
      <TaskDetailDialog
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(open) => { if (!open) setDetailTask(null); }}
      />
      <BulkActionsBar
        selectedCount={selectedTasks.length}
        onDelete={() => console.log("Delete tasks:", selectedTasks)}
        onChangeStatus={(status) => console.log("Change status:", status, selectedTasks)}
        statusOptions={taskStatusOptions}
      />
    </div>
  );
}
