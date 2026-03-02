"use client";

import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SchedulerList } from "@/components/scheduler/scheduler-list";
import { SchedulerForm } from "@/components/scheduler/scheduler-form";
import type { MessageScheduler } from "@/types";

export default function SchedulerPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pengirim Pesan" 
        description="Jadwalkan pengiriman pesan WhatsApp ke banyak kontak"
      >
        <div className="flex items-center gap-2">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Jadwal Baru
          </Button>
        </div>
      </PageHeader>
      
      <SchedulerList key={refreshKey} />
      
      <SchedulerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
