"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ExtensionAuthBridge } from "@/components/extension/auth-bridge";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { CommandPalette } from "@/components/shared/command-palette";
import { AuthProvider } from "@/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      {/* Extension Auth Bridge - sends auth data to Chrome Extension */}
      <ExtensionAuthBridge />
    <div className="min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pt-2 pb-4 sm:px-6 sm:pt-3 sm:pb-6 lg:px-8 lg:pt-4 lg:pb-8">{children}</main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
    </AuthProvider>
  );
}
