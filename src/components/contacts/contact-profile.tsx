"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Calendar, Pencil, Plus, UserCheck, ListTodo, MessageSquare, Receipt, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TagBadge } from "@/components/tags/tag-badge";
import { NoteForm } from "@/components/notes/note-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactChatHistory } from "@/components/contacts/contact-chat-history";
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
import type { Contact, Deal, Note, Activity, Task } from "@/types";

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
  // WA conversations disabled - moved to extension
  // const [waConversations, setWaConversations] = useState<WaConversation[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const customFields = Object.entries(contact.custom_fields || {});

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
        fetches.push(
          fetch(`/api/notes?contact_id=${contact.id}`)
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((json) => setNotes(json.data || []))
        );

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

        // Fetch WA conversations — API doesn't support contact_id filter,
        // so we pass empty array for now
        setWaConversations([]);

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
          {contact.status === "lead" && (
            <Button
              variant="outline"
              className="text-success-foreground border-success/30 hover:bg-success/10"
              onClick={() => toast.success("Contact berhasil dikonversi ke Customer")}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Convert to Customer
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <ContactForm open={editOpen} onOpenChange={setEditOpen} contact={contact} />
      <TaskForm open={taskFormOpen} onOpenChange={setTaskFormOpen} defaultContactId={contact.id} />
      <DealForm open={dealFormOpen} onOpenChange={setDealFormOpen} defaultContactId={contact.id} />

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

              {owner && (
                <>
                  <Separator className="my-4" />
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
                      if (waConversations.length > 0) {
                        router.push(`/messaging?conv=${waConversations[0].id}`);
                      } else {
                        toast.info("Belum ada percakapan WhatsApp untuk kontak ini");
                      }
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
            <TabsList>
              <TabsTrigger value="deals">
                Deals ({deals.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity ({activities.length})
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-1 h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <Receipt className="mr-1 h-3 w-3" />
                Transaksi
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
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium text-sm">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {deal.status === "won"
                                ? "Menang"
                                : deal.status === "lost"
                                ? "Kalah"
                                : "Open"}{" "}
                              &middot;{" "}
                              {deal.expected_close_date
                                ? formatDate(deal.expected_close_date)
                                : "No date"}
                            </p>
                          </div>
                          <span className="font-semibold text-sm">
                            {formatCurrency(deal.value)}
                          </span>
                        </Link>
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
                  <NoteForm onSubmit={(content) => console.log("New note:", content)} />
                  {loadingRelated ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => {
                        const author = note.author;
                        return (
                          <div key={note.id} className="border-l-2 pl-4">
                            <p className="text-sm">{note.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {author?.full_name} &middot;{" "}
                              {formatRelativeTime(note.created_at)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada catatan
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

            <TabsContent value="chat" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ContactChatHistory />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center py-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium text-sm">Riwayat Transaksi</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data transaksi akan muncul di sini setelah integrasi payment aktif
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
