"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ClipboardList, Loader2, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  contactName: string | null;
  description?: string;
}

interface UpcomingTasksProps {
  onTaskClick?: (task: Task) => void;
}

const priorityLabels: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

export function UpcomingTasks({ onTaskClick }: UpcomingTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasFetched = useRef(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/dashboard/tasks?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error("Gagal memuat tasks");
      const json = await res.json();
      setTasks(json.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent re-fetch on tab switch (React re-mount)
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchTasks();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const hasData = tasks.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Reminder
          </CardTitle>
          <Link
            href="/tasks"
            className="text-sm text-foreground hover:text-foreground hover:underline"
          >
            Lihat semua
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : hasData ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(task.dueDate)}</span>
                      {task.contactName && (
                        <span>• {task.contactName}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada reminder</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Reminder</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={priorityColors[selectedTask.priority]}>
                    {priorityLabels[selectedTask.priority]}
                  </Badge>
                  <Badge variant="secondary">{selectedTask.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedTask.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {selectedTask.contactName && (
                  <div>
                    <p className="text-muted-foreground">Kontak</p>
                    <p className="font-medium">{selectedTask.contactName}</p>
                  </div>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Deskripsi</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Tutup
                </Button>
                <Button className="flex-1" asChild>
                  <a href={`/tasks/${selectedTask.id}`}>Buka Detail</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
