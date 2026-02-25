"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import type { Deal } from "@/types";

interface KanbanCardProps {
  deal: Deal;
  isOverlay?: boolean;
  onClick?: () => void;
}

export function KanbanCard({ deal, isOverlay, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contact = deal.contact;
  const owner = deal.owner;
  const contactName = contact
    ? `${contact.first_name} ${contact.last_name || ""}`.trim()
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm hover:bg-muted/50 transition-colors duration-150 cursor-default",
        isDragging && "opacity-50",
        isOverlay && "shadow-xl ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={onClick}
            className="text-sm font-medium hover:underline line-clamp-2 text-left"
          >
            {deal.title}
          </button>

          <p className="mt-1 text-sm font-semibold text-primary">
            {formatCurrency(deal.value)}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {contactName && <span>{contactName}</span>}
            </div>
            {owner && (
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(owner.full_name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {deal.expected_close_date && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(deal.expected_close_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
