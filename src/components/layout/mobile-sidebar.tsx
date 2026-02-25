"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarSections, bottomNav } from "@/config/navigation";
import { hasMenuAccess, useMenuAccessMap } from "@/stores/menu-access";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  useMenuAccessMap();

  const filteredSections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasMenuAccess(user?.id || "", item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border px-4 h-14 flex flex-row items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            R
          </div>
          <SheetTitle className="ml-2 text-lg text-sidebar-foreground">PelangganPro</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-3 py-3">
          {filteredSections.map((section, sectionIdx) => (
            <div key={section.label ?? "top"}>
              {section.label && (
                <p className={cn(
                  "px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40",
                  "mt-2"
                )}>
                  {section.label}
                </p>
              )}
              {sectionIdx > 0 && !section.label && (
                <Separator className="my-2" />
              )}

              <nav className="flex flex-col gap-0.5 mb-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                    >
                      <div className="relative flex items-center">
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-sidebar-primary" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-3 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                            !isActive && "text-sidebar-foreground/60"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-primary")} />
                          <span className="text-sm">{item.title}</span>
                          {item.href === "/messaging" && 0 > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground min-w-[18px]">
                              {0}
                            </span>
                          )}
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </ScrollArea>

        {/* Bottom: Activity Log + Settings side by side */}
        <div className="border-t border-sidebar-border px-3 py-2">
          <div className="flex gap-1">
            {bottomNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-2 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                      !isActive && "text-sidebar-foreground/60"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                    <span className="text-xs">{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
