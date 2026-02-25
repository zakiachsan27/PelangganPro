"use client";

import { useState } from "react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PipelineFunnelChart } from "@/components/dashboard/pipeline-funnel";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { PeriodFilter, type PeriodValue } from "@/components/dashboard/period-filter";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { useAuth } from "@/providers/auth-provider";

function formatTanggal(date: Date): string {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodValue>("30d");
  const { user } = useAuth();

  const firstName = user?.fullName?.split(" ")[0] || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Selamat Datang{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatTanggal(new Date())}
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>
      <DashboardStats />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <PipelineFunnelChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivities />
        <UpcomingTasks />
      </div>
    </div>
  );
}
