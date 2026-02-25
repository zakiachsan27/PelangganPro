"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Building2,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NoteForm } from "@/components/notes/note-form";
import { CompanyForm } from "@/components/companies/company-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { DealForm } from "@/components/deals/deal-form";
import { getInitials, formatCurrency, formatDate, formatPhone, formatRelativeTime } from "@/lib/format";
import type { Company, Contact, Deal, Note } from "@/types";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addDealOpen, setAddDealOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const companyRes = await fetch(`/api/companies/${id}`);
      if (!companyRes.ok) {
        setNotFoundState(true);
        return;
      }
      const companyData = await companyRes.json();
      setCompany(companyData);

      // Fetch related data in parallel
      const [contactsRes, dealsRes, notesRes] = await Promise.all([
        fetch(`/api/contacts?company_id=${id}&limit=100`),
        fetch(`/api/deals?company_id=${id}&limit=100`),
        fetch(`/api/notes?company_id=${id}`),
      ]);

      if (contactsRes.ok) {
        const json = await contactsRes.json();
        setContacts(json.data || []);
      }
      if (dealsRes.ok) {
        const json = await dealsRes.json();
        setDeals(json.data || []);
      }
      if (notesRes.ok) {
        const json = await notesRes.json();
        setNotes(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (notFoundState) {
    notFound();
  }

  if (loading || !company) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {company.industry && (
              <Badge variant="outline">{company.industry}</Badge>
            )}
            {company.city && (
              <span className="text-sm text-muted-foreground">
                {company.city}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Info Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{company.size || "-"} karyawan</span>
            </div>
            {company.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={company.website}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhone(company.phone)}</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{company.email}</span>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {company.address}
                  {company.city ? `, ${company.city}` : ""}
                </span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-4 text-center pt-2">
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Contacts</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{deals.length}</p>
                <p className="text-xs text-muted-foreground">Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Contacts, Deals & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Contacts ({contacts.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddContactOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => {
                    const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
                    return (
                      <Link
                        key={contact.id}
                        href={`/contacts/${contact.id}`}
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {contact.position || contact.email || "-"}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(contact.lifetime_value)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada contacts
                </p>
              )}
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Deals ({deals.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddDealOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {deals.length > 0 ? (
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
                            : ""}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        {formatCurrency(deal.value)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada deals
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes ({notes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteForm onSubmit={(content) => console.log("New company note:", content)} />
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-2 pl-4">
                      <p className="text-sm">{note.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.author?.full_name || "Unknown"} &middot;{" "}
                        {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada catatan
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CompanyForm open={editOpen} onOpenChange={setEditOpen} company={company} />
      <ContactForm open={addContactOpen} onOpenChange={setAddContactOpen} />
      <DealForm open={addDealOpen} onOpenChange={setAddDealOpen} />
    </div>
  );
}
