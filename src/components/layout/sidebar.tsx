"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarSections, bottomNav } from "@/config/navigation";
import { hasMenuAccess, useMenuAccessMap } from "@/stores/menu-access";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  useMenuAccessMap(); // subscribe to reactive updates

  const filteredSections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasMenuAccess(user?.id || "", item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              R
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">PelangganPro</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              R
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        {filteredSections.map((section, sectionIdx) => (
          <div key={section.label ?? "top"}>
            {/* Section label */}
            {section.label && !collapsed && (
              <p className={cn(
                "px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40",
                "mt-2"
              )}>
                {section.label}
              </p>
            )}
            {sectionIdx > 0 && collapsed && (
              <Separator className="my-2" />
            )}
            {sectionIdx > 0 && !collapsed && !section.label && (
              <Separator className="my-2" />
            )}

            <nav className="flex flex-col gap-0.5 mb-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div className="relative flex items-center">
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-sidebar-primary" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-3 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          collapsed && "justify-center px-2",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          !isActive && "text-sidebar-foreground/60"
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                        {!collapsed && <span className="text-sm truncate">{item.title}</span>}
                        {!collapsed && item.href === "/messaging" && 0 > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground min-w-[18px]">
                            {0}
                          </span>
                        )}
                      </Button>
                      {collapsed && item.href === "/messaging" && 0 > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* Bottom: Activity Log + Settings side by side, then collapse */}
      <div className="border-t border-sidebar-border px-3 py-2 space-y-1">
        <div className={cn("flex gap-1", collapsed ? "flex-col" : "flex-row")}>
          {bottomNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full gap-2 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                    !collapsed && "justify-start",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    !isActive && "text-sidebar-foreground/60"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                  {!collapsed && <span className="text-xs">{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full h-7 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-2")}
          onClick={onToggle}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
