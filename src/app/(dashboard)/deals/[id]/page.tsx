"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trophy, XCircle, Calendar, User, Building2, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NoteForm } from "@/components/notes/note-form";
import { DealForm } from "@/components/deals/deal-form";
import { toast } from "sonner";
import {
  getInitials,
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/lib/format";
import type { Deal, Note, Activity } from "@/types";

export default function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchDeal = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/deals/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Gagal memuat deal");
      const data: Deal = await res.json();
      setDeal(data);
    } catch (err) {
      console.error("Failed to load deal:", err);
      toast.error("Gagal memuat data deal");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes?deal_id=${id}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }, [id]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/activities?entity_type=deal&entity_id=${id}`);
      if (res.ok) {
        const json = await res.json();
        setActivities(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
    fetchNotes();
    fetchActivities();
  }, [fetchDeal, fetchNotes, fetchActivities]);

  async function handleAddNote(content: string) {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, deal_id: id }),
      });
      if (!res.ok) throw new Error("Gagal menambah catatan");
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      console.error("Failed to add note:", err);
      toast.error("Gagal menambah catatan");
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-muted-foreground">Deal tidak ditemukan</p>
        <Link href="/deals">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Deals
          </Button>
        </Link>
      </div>
    );
  }

  const contact = deal.contact;
  const company = deal.company;
  const owner = deal.owner;
  const stage = deal.stage;

  const contactName = contact
    ? `${contact.first_name} ${contact.last_name || ""}`.trim()
    : null;

  const statusColors: Record<string, string> = {
    open: "bg-primary/10 text-primary",
    won: "bg-success/15 text-success-foreground",
    lost: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[deal.status]}`}>
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
        <div className="flex gap-2">
          {deal.status === "open" && (
            <>
              <Button variant="outline" className="text-success-foreground border-success/30 hover:bg-success/10">
                <Trophy className="mr-2 h-4 w-4" />
                Won
              </Button>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <XCircle className="mr-2 h-4 w-4" />
                Lost
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Deal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(deal.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{deal.currency}</p>
            </div>

            <Separator />

            {contact && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <Link href={`/contacts/${contact.id}`} className="hover:underline">
                  {contactName}
                </Link>
              </div>
            )}
            {company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link href={`/companies/${company.id}`} className="hover:underline">
                  {company.name}
                </Link>
              </div>
            )}
            {deal.expected_close_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Expected: {formatDate(deal.expected_close_date)}</span>
              </div>
            )}
            {deal.actual_close_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Closed: {formatDate(deal.actual_close_date)}</span>
              </div>
            )}
            {deal.source && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{deal.source}</Badge>
              </div>
            )}
            {deal.won_lost_reason && (
              <div className="rounded-lg bg-muted p-3 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Alasan:</p>
                <p className="text-sm">{deal.won_lost_reason}</p>
              </div>
            )}

            {owner && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Owner:</p>
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getInitials(owner.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{owner.full_name}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Activity & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log ({activities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const details = activity.details as Record<string, string>;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {activity.action === "stage_changed"
                              ? `Pindah dari "${details.from_stage}" ke "${details.to_stage}"`
                              : activity.action === "won"
                              ? `Deal won (${formatCurrency(Number(details.value))})`
                              : activity.action === "lost"
                              ? `Deal lost: ${details.reason}`
                              : activity.action === "note_added"
                              ? `Catatan ditambah: ${details.preview}`
                              : activity.action === "created"
                              ? `Deal dibuat`
                              : activity.action.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.actor?.full_name} &middot; {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes ({notes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteForm onSubmit={handleAddNote} />
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-2 pl-4">
                      <p className="text-sm">{note.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.author?.full_name} &middot; {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada catatan</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DealForm open={editOpen} onOpenChange={setEditOpen} deal={deal} onSuccess={fetchDeal} />
    </div>
  );
}
