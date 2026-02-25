"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sementara disable chat history karena messaging dihapus
export function ContactChatHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-xl bg-muted/50 p-4 mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Fitur chat dipindahkan ke extension</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
        Silakan gunakan PelangganPro extension di WhatsApp Web untuk melihat chat
      </p>
    </div>
  );
}
