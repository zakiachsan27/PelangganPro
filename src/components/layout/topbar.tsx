"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { NotificationPanel } from "@/components/shared/notification-panel";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-4 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
