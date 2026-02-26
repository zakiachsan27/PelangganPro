"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";

interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/dashboard/activities?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error("Gagal memuat aktivitas");
      const json = await res.json();
      setActivities(json.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent re-fetch on tab switch (React re-mount)
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchActivities();
  }, []);

  const hasData = activities.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasData ? (
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.actor}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium truncate">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
            <Clock className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Belum ada aktivitas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
