import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpcomingTasks() {
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
        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
          <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">Belum ada tasks</p>
        </div>
      </CardContent>
    </Card>
  );
}
