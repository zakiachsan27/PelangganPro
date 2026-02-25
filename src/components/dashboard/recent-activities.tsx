import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
          <Clock className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">Belum ada aktivitas</p>
        </div>
      </CardContent>
    </Card>
  );
}
