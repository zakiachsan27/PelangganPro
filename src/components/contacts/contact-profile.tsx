"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Calendar, Pencil, Plus, Handshake, ListTodo, MessageSquare, Users, Loader2, Edit2, Check, X, Trash2, Trash, TicketCheck, UserPlus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TagBadge } from "@/components/tags/tag-badge";
import { NoteForm } from "@/components/notes/note-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { TaskForm } from "@/components/tasks/task-form";
import { DealForm } from "@/components/deals/deal-form";
import {
  getInitials,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPhone,
} from "@/lib/format";
import { toast } from "sonner";
import type { Contact, Deal, Note, Activity, Task, Ticket, Profile, PipelineStage } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactProfileProps {
  contact: Contact;
}

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  web: "Web",
  referral: "Referral",
  tokopedia: "Tokopedia",
  shopee: "Shopee",
};

const statusColors: Record<string, string> = {
  lead: "bg-warning/15 text-warning-foreground",
  active: "bg-primary/10 text-primary",
  inactive: "bg-secondary text-secondary-foreground",
  customer: "bg-success/15 text-success-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/15 text-warning-foreground",
  urgent: "bg-destructive/10 text-destructive",
};

// Note Item Component with Edit and Delete functionality
interface NoteItemProps {
  note: Note;
  onUpdated: () => void;
}

function NoteItem({ note, onUpdated }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const author = note.author;

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        toast.success("Catatan berhasil diperbarui");
        setIsEditing(false);
        onUpdated();
      } else {
        toast.error("Gagal memperbarui catatan");
      }
    } catch {
      toast.error("Gagal memperbarui catatan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Catatan berhasil dihapus");
        setShowDeleteConfirm(false);
        onUpdated();
      } else {
        toast.error("Gagal menghapus catatan");
      }
    } catch {
      toast.error("Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <textarea
          className="w-full min-h-[100px] p-3 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          disabled={isSaving}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="inline h-3 w-3 mr-1" />
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !editContent.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Check className="inline h-3 w-3 mr-1" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors">
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
        {note.content}
      </p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-muted-foreground">
          {author?.full_name || "Unknown"} &middot; {formatRelativeTime(note.created_at)}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-white rounded-md transition-colors"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Hapus Catatan</h3>
                <p className="text-sm text-muted-foreground">
                  Apakah Anda yakin ingin menghapus catatan ini?
                </p>
              </div>
            </div>
            
            <div className="bg-muted rounded-md p-3 mb-4 max-h-24 overflow-hidden">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {note.content}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContactProfile({ contact }: ContactProfileProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();

  // Use joined data from the API response
  const company = contact.company ?? null;
  const owner = contact.owner ?? null;

  // State for related entities fetched from APIs
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // WA conversations disabled - moved to extension
  // const [waConversations, setWaConversations] = useState<WaConversation[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  
  // Assign owner dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [currentOwnerId, setCurrentOwnerId] = useState<string | null>(contact.owner_id);

  const customFields = Object.entries(contact.custom_fields || {});

  // State for pipeline stages and stage updates
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);

  // Fetch stages for the pipeline
  useEffect(() => {
    async function fetchStages() {
      if (deals.length === 0) return;
      
      // Get pipeline_id from first deal
      const pipelineId = deals[0]?.pipeline_id;
      if (!pipelineId) return;

      try {
        const res = await fetch(`/api/pipelines/${pipelineId}/stages`);
        if (res.ok) {
          const json = await res.json();
          setStages(json.data || []);
        }
      } catch {
        // Silently handle error
      }
    }
    fetchStages();
  }, [deals]);

  // Handle stage update for a deal
  const handleStageUpdate = async (dealId: string, newStageId: string) => {
    setUpdatingStageId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: newStageId }),
      });

      if (res.ok) {
        const updatedDeal = await res.json();
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: updatedDeal.stage, stage_id: newStageId } : d))
        );
        toast.success("Stage berhasil diperbarui");
      } else {
        toast.error("Gagal memperbarui stage");
      }
    } catch {
      toast.error("Gagal memperbarui stage");
    } finally {
      setUpdatingStageId(null);
    }
  };

  // Fetch notes function (extracted for reuse)
  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?contact_id=${contact.id}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data || []);
      }
    } catch {
      // Silently handle error
    }
  };

  // Auto-update contact status if they have deals but status is still "lead"
  useEffect(() => {
    if (deals.length > 0 && contact.status === "lead") {
      // Update contact status to "customer" via API
      fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "customer" }),
      }).then(() => {
        // Refresh page to show updated status
        router.refresh();
      });
    }
  }, [deals.length, contact.status, contact.id, router]);

  // Fetch all related entities on mount
  useEffect(() => {
    async function fetchRelated() {
      setLoadingRelated(true);
      try {
        const fetches: Promise<void>[] = [];

        // Fetch deals for this contact
        fetches.push(
          fetch(`/api/deals?contact_id=${contact.id}&limit=100`)
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((json) => setDeals(json.data || []))
        );

        // Fetch notes for this contact
        fetches.push(fetchNotes());

        // Fetch activities for this contact
        fetches.push(
          fetch(`/api/activities?entity_type=contact&entity_id=${contact.id}`)
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((json) => setActivities(json.data || []))
        );

        // Fetch tasks for this contact
        fetches.push(
          fetch(`/api/tasks?contact_id=${contact.id}&limit=100`)
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((json) => setTasks(json.data || []))
        );

        // Fetch tickets for this contact
        fetches.push(
          fetch(`/api/tickets?contact_id=${contact.id}&limit=100`)
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((json) => setTickets(json.data || []))
        );

        // Fetch WA conversations — disabled, moved to extension
        // setWaConversations([]);

        // Fetch related contacts from same company
        if (contact.company_id) {
          fetches.push(
            fetch(`/api/contacts?company_id=${contact.company_id}&limit=10`)
              .then((r) => r.ok ? r.json() : { data: [] })
              .then((json) => {
                const others = (json.data || []).filter(
                  (c: Contact) => c.id !== contact.id
                );
                setRelatedContacts(others);
              })
          );
        }

        await Promise.all(fetches);
      } catch {
        // Silently handle errors — empty arrays are shown
      } finally {
        setLoadingRelated(false);
      }
    }

    fetchRelated();
  }, [contact.id, contact.company_id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {contact.position} {company ? `di ${company.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {deals.length > 0 ? (
            <Button
              variant="outline"
              disabled
              className="text-success border-success/30 bg-success/5"
            >
              <Check className="mr-2 h-4 w-4" />
              Sudah Deal
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => setDealFormOpen(true)}
            >
              <Handshake className="mr-2 h-4 w-4" />
              Convert to Deal
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <ContactForm open={editOpen} onOpenChange={setEditOpen} contact={contact} onSuccess={() => router.refresh()} />
      <TaskForm open={taskFormOpen} onOpenChange={setTaskFormOpen} defaultContactId={contact.id} />
      <DealForm open={dealFormOpen} onOpenChange={setDealFormOpen} defaultContactId={contact.id} />

      {/* Assign To Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Pilih user untuk menangani contact ini:
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {loadingUsers || users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {loadingUsers ? "Memuat data user..." : "Tidak ada user"}
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={async () => {
                      if (assigning) return;
                      setAssigning(true);
                      try {
                        const res = await fetch(`/api/contacts/${contact.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ owner_id: user.id }),
                        });
                        if (!res.ok) throw new Error();
                        toast.success(`Contact diassign ke ${user.full_name}`);
                        setCurrentOwnerId(user.id);
                        setAssignDialogOpen(false);
                        router.refresh();
                      } catch {
                        toast.error("Gagal assign contact");
                      } finally {
                        setAssigning(false);
                      }
                    }}
                    disabled={assigning || user.id === currentOwnerId}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      user.id === currentOwnerId
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium">{user.full_name}</span>
                    {user.id === currentOwnerId && (
                      <span className="text-xs text-primary">(Saat ini)</span>
                    )}
                  </button>
                ))
              )}
            </div>
            {currentOwnerId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  if (assigning) return;
                  setAssigning(true);
                  try {
                    const res = await fetch(`/api/contacts/${contact.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ owner_id: null }),
                    });
                    if (!res.ok) throw new Error();
                    toast.success("Assignment dihapus");
                    setCurrentOwnerId(null);
                    setAssignDialogOpen(false);
                    router.refresh();
                  } catch {
                    toast.error("Gagal menghapus assignment");
                  } finally {
                    setAssigning(false);
                  }
                }}
                disabled={assigning}
              >
                Hapus Assignment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-semibold">{fullName}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[contact.status]
                    }`}
                  >
                    {contact.status}
                  </span>
                  {contact.source && (
                    <Badge variant="outline" className="text-xs">
                      {sourceLabels[contact.source] || contact.source}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhone(contact.phone)}</span>
                  </div>
                )}
                {company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/companies/${company.id}`}
                      className="hover:underline"
                    >
                      {company.name}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Dibuat {formatDate(contact.created_at)}</span>
                </div>
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(contact.lifetime_value)}
                  </p>
                  <p className="text-xs text-muted-foreground">Lifetime Value</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{deals.length}</p>
                  <p className="text-xs text-muted-foreground">Deals</p>
                </div>
              </div>

              {/* Pipeline Stage Section */}
              {deals.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Pipeline Stage</p>
                    <div className="space-y-2">
                      {deals.map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between text-sm">
                          <Link href={`/deals/${deal.id}`} className="truncate flex-1 hover:underline">
                            {deal.title}
                          </Link>
                          {deal.stage ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: deal.stage.color }}
                              />
                              <span className="text-xs font-medium">{deal.stage.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Custom Fields</p>
                    <div className="space-y-2">
                      {customFields.map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Assign To Section */}
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Assign To</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {owner ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(owner.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{owner.full_name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Belum di-assign</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      setAssignDialogOpen(true);
                      
                      // Fetch users if not loaded
                      if (users.length === 0) {
                        setLoadingUsers(true);
                        const supabase = createSupabaseBrowserClient();
                        const { data, error } = await supabase
                          .from("profiles")
                          .select("id, full_name, avatar_url")
                          .eq("is_active", true)
                          .order("full_name");
                        
                        if (!error && data) {
                          setUsers(data as Profile[]);
                        }
                        setLoadingUsers(false);
                      }
                    }}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    {owner ? "Ganti" : "Assign"}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setTaskFormOpen(true)}>
                  <ListTodo className="mr-1 h-3 w-3" />
                  Add Task
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDealFormOpen(true)}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Deal
                </Button>
                {contact.whatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // WhatsApp conversations moved to extension
                      toast.info("Gunakan extension CRM untuk melihat percakapan WhatsApp");
                    }}
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RFM Score — placeholder, not yet implemented */}

          {/* Related Contacts */}
          {relatedContacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Kontak Terkait ({relatedContacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedContacts.slice(0, 5).map((rc) => {
                    const rcName = `${rc.first_name} ${rc.last_name || ""}`.trim();
                    return (
                      <Link
                        key={rc.id}
                        href={`/contacts/${rc.id}`}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 text-sm"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(rcName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{rcName}</p>
                          <p className="text-xs text-muted-foreground truncate">{rc.position || rc.email}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="deals">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="deals">
                Deals ({deals.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <TicketCheck className="mr-1 h-3 w-3" />
                Tickets ({tickets.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity ({activities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : deals.length > 0 ? (
                    <div className="space-y-3">
                      {deals.map((deal) => (
                        <div
                          key={deal.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <Link href={`/deals/${deal.id}`}>
                              <p className="font-medium text-sm hover:underline">{deal.title}</p>
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {/* Stage Selector */}
                              <Select
                                value={deal.stage_id}
                                onValueChange={(value) => handleStageUpdate(deal.id, value)}
                                disabled={updatingStageId === deal.id}
                              >
                                <SelectTrigger className="h-6 w-auto min-w-[120px] text-xs border-0 bg-transparent p-0 hover:bg-muted/50 rounded px-2">
                                  <div className="flex items-center gap-1.5">
                                    {deal.stage && (
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: deal.stage.color }}
                                      />
                                    )}
                                    <SelectValue placeholder="Pilih stage">
                                      {deal.stage?.name || "Pilih stage"}
                                    </SelectValue>
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {stages.map((stage) => (
                                    <SelectItem key={stage.id} value={stage.id} className="text-xs">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: stage.color }}
                                        />
                                        <span>{stage.name}</span>
                                        {stage.is_won && (
                                          <Badge variant="outline" className="ml-1 text-[10px] bg-success/10 text-success">Won</Badge>
                                        )}
                                        {stage.is_lost && (
                                          <Badge variant="outline" className="ml-1 text-[10px] bg-destructive/10 text-destructive">Lost</Badge>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <span className="text-xs text-muted-foreground">
                                &middot;{" "}
                                {deal.expected_close_date
                                  ? formatDate(deal.expected_close_date)
                                  : "No date"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">
                              {formatCurrency(deal.value)}
                            </span>
                            {updatingStageId === deal.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada deals untuk kontak ini
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const assignee = task.assignee ?? null;
                        return (
                          <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span className="text-xs text-muted-foreground">
                                    Due: {formatDate(task.due_date)}
                                  </span>
                                )}
                                {assignee && (
                                  <span className="text-xs text-muted-foreground">
                                    → {assignee.full_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant={task.status === "done" ? "default" : "outline"} className="text-xs">
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada task untuk kontak ini
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <NoteForm 
                    contactId={contact.id} 
                    onSubmit={() => fetchNotes()} 
                  />
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : notes.length > 0 ? (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <NoteItem 
                          key={note.id} 
                          note={note} 
                          onUpdated={() => fetchNotes()}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada catatan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/tickets/${ticket.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                ticket.status === "open" ? "bg-blue-500/10 text-blue-600" :
                                ticket.status === "in_progress" ? "bg-primary/10 text-primary" :
                                ticket.status === "waiting" ? "bg-yellow-500/10 text-yellow-600" :
                                ticket.status === "resolved" ? "bg-success/15 text-success-foreground" :
                                "bg-secondary text-secondary-foreground"
                              }`}>
                                {ticket.status.replace("_", " ")}
                              </span>
                              <Badge variant={
                                ticket.priority === "urgent" ? "destructive" :
                                ticket.priority === "high" ? "default" :
                                ticket.priority === "medium" ? "secondary" : "outline"
                              } className="text-xs">
                                {ticket.priority}
                              </Badge>
                            </div>
                          </div>
                          {ticket.assignee && (
                            <div className="flex items-center gap-2 ml-4">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(ticket.assignee.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada ticket untuk kontak ini
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((activity) => {
                        const actor = activity.actor ?? null;
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {activity.action.replace("_", " ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {actor?.full_name} &middot;{" "}
                                {formatRelativeTime(activity.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada aktivitas
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>
      </div>
    </div>
  );
}
