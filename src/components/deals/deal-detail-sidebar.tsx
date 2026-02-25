"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoteForm } from "@/components/notes/note-form";
import { DealForm } from "@/components/deals/deal-form";
import { Trophy, XCircle, Pencil, User, Building2, Calendar, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from "@/lib/format";
import { toast } from "sonner";
import type { Deal, Note, Activity, PipelineStage } from "@/types";

interface DealDetailSidebarProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange?: (dealId: string, stageId: string) => void;
  stages?: PipelineStage[];
}

export function DealDetailSidebar({ deal, open, onOpenChange, onStageChange, stages = [] }: DealDetailSidebarProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch notes and activities when sidebar opens with a deal
  useEffect(() => {
    if (!deal || !open) {
      setNotes([]);
      setActivities([]);
      return;
    }

    async function fetchNotes() {
      setLoadingNotes(true);
      try {
        const res = await fetch(`/api/notes?deal_id=${deal!.id}`);
        if (res.ok) {
          const json = await res.json();
          setNotes(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoadingNotes(false);
      }
    }

    async function fetchActivities() {
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/activities?entity_type=deal&entity_id=${deal!.id}`);
        if (res.ok) {
          const json = await res.json();
          setActivities(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoadingActivities(false);
      }
    }

    fetchNotes();
    fetchActivities();
  }, [deal?.id, open]);

  if (!deal) return null;

  const contact = deal.contact;
  const company = deal.company;
  const owner = deal.owner;
  const stage = deal.stage;
  const openStages = stages.filter((s) => !s.is_won && !s.is_lost);

  const contactName = contact
    ? `${contact.first_name} ${contact.last_name || ""}`.trim()
    : null;

  const statusColors: Record<string, string> = {
    open: "bg-primary/10 text-primary",
    won: "bg-success/15 text-success-foreground",
    lost: "bg-destructive/10 text-destructive",
  };

  async function handleAddNote(content: string) {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, deal_id: deal!.id }),
      });
      if (!res.ok) throw new Error("Gagal menambah catatan");
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      console.error("Failed to add note:", err);
      toast.error("Gagal menambah catatan");
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left pr-6">{deal.title}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-5">
            {/* Value & Status */}
            <div className="text-center rounded-lg bg-muted/30 py-4">
              <p className="text-xl font-bold text-primary">{formatCurrency(deal.value)}</p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[deal.status]}`}>
                  {deal.status === "won" ? "Menang" : deal.status === "lost" ? "Kalah" : "Open"}
                </span>
                {stage && (
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    {stage.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stage Change */}
            {deal.status === "open" && openStages.length > 0 && (
              <div className="space-y-2">
                <Select
                  value={deal.stage_id}
                  onValueChange={(stageId) => {
                    if (onStageChange) {
                      onStageChange(deal.id, stageId);
                      toast.success("Stage berhasil diubah");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Ubah stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {openStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-success-foreground border-success/30 hover:bg-success/10"
                    onClick={() => toast.success("Deal marked as Won (demo)")}
                  >
                    <Trophy className="mr-1.5 h-3.5 w-3.5" />
                    Won
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => toast.success("Deal marked as Lost (demo)")}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Lost
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Details */}
            <div className="space-y-2.5 text-sm">
              {contact && (
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Link href={`/contacts/${contact.id}`} className="hover:underline">
                    {contactName}
                  </Link>
                </div>
              )}
              {company && (
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Link href={`/companies/${company.id}`} className="hover:underline">
                    {company.name}
                  </Link>
                </div>
              )}
              {deal.expected_close_date && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Expected: {formatDate(deal.expected_close_date)}</span>
                </div>
              )}
              {owner && (
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-4 w-4 shrink-0">
                    <AvatarFallback className="text-[8px]">{getInitials(owner.full_name)}</AvatarFallback>
                  </Avatar>
                  <span>{owner.full_name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Link href={`/deals/${deal.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Detail Lengkap
                </Button>
              </Link>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold mb-2">Notes ({notes.length})</p>
              <NoteForm onSubmit={handleAddNote} />
              {loadingNotes ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-2 border-primary/20 pl-3">
                      <p className="text-sm leading-relaxed">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.author?.full_name} &middot; {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Separator />

            {/* Activity Log */}
            <div className="pb-4">
              <p className="text-sm font-semibold mb-2">Activity ({activities.length})</p>
              {loadingActivities ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-2.5">
                  {activities.slice(0, 5).map((activity) => {
                    const details = activity.details as Record<string, string>;
                    return (
                      <div key={activity.id} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                        <div>
                          <p className="text-sm">
                            {activity.action === "stage_changed"
                              ? `${details.from_stage} → ${details.to_stage}`
                              : activity.action === "created"
                              ? "Deal dibuat"
                              : activity.action.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {activity.actor?.full_name} &middot; {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada aktivitas</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DealForm open={editOpen} onOpenChange={setEditOpen} deal={deal} />
    </>
  );
}
