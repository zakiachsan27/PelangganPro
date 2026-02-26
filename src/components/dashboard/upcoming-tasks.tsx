"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  contactName: string | null;
}

const priorityLabels: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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

  const hasData = tasks.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming Tasks</CardTitle>
        <Link
          href="/tasks"
          className="text-sm text-primary hover:underline"
        >
          Lihat semua
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasData ? (
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.contactName && (
                    <p className="text-xs text-muted-foreground">{task.contactName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-xs shrink-0 ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Belum ada tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
