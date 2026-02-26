"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import { StickyNote, User, Calendar, Filter, X, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Note, Profile, Contact } from "@/types";

interface FilterValues {
  authorId: string | null;
  contactId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Profile[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterValues>({
    authorId: null,
    contactId: null,
    dateFrom: null,
    dateTo: null,
    search: "",
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filters.authorId) params.set("author_id", filters.authorId);
      if (filters.contactId) params.set("contact_id", filters.contactId);
      if (filters.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters.dateTo) params.set("date_to", filters.dateTo);
      
      const res = await fetch(`/api/notes?${params}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.authorId, filters.contactId, filters.dateFrom, filters.dateTo]);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles?limit=100");
      if (res.ok) {
        const json = await res.json();
        setAuthors(json.data || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts?limit=100");
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchAuthors();
    fetchContacts();
  }, [fetchAuthors, fetchContacts]);

  // Client-side search filtering
  useEffect(() => {
    let result = notes;
    
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (note) =>
          note.content.toLowerCase().includes(searchLower) ||
          note.author?.full_name.toLowerCase().includes(searchLower) ||
          (note.contact?.first_name + " " + (note.contact?.last_name || "")).toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredNotes(result);
  }, [notes, filters.search]);

  const handleClearFilters = () => {
    setFilters({
      authorId: null,
      contactId: null,
      dateFrom: null,
      dateTo: null,
      search: "",
    });
  };

  const hasActiveFilters = filters.authorId || filters.contactId || filters.dateFrom || filters.dateTo;

  const formatRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: id,
    });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: id });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Catatan" 
        description="Semua catatan dari kontak Anda"
      />
      
      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        {/* Search and Toggle */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari catatan..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full" />
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Author Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Akun yang menambahkan
                </label>
                <select
                  value={filters.authorId || ""}
                  onChange={(e) => setFilters({ ...filters, authorId: e.target.value || null })}
                  className="w-full h-9 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Semua akun</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Kontak
                </label>
                <select
                  value={filters.contactId || ""}
                  onChange={(e) => setFilters({ ...filters, contactId: e.target.value || null })}
                  className="w-full h-9 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Semua kontak</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name || ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Rentang Tanggal
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
                    className="flex-1 h-9 text-sm"
                    placeholder="Dari"
                  />
                  <span className="text-muted-foreground self-center">-</span>
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
                    className="flex-1 h-9 text-sm"
                    placeholder="Sampai"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Hapus filter
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.authorId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                <User className="h-3 w-3" />
                {authors.find((a) => a.id === filters.authorId)?.full_name}
                <button
                  onClick={() => setFilters({ ...filters, authorId: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.contactId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                <StickyNote className="h-3 w-3" />
                {(() => {
                  const c = contacts.find((c) => c.id === filters.contactId);
                  return c ? `${c.first_name} ${c.last_name || ""}` : "";
                })()}
                <button
                  onClick={() => setFilters({ ...filters, contactId: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                <Calendar className="h-3 w-3" />
                {filters.dateFrom && formatDate(filters.dateFrom)}
                {filters.dateFrom && filters.dateTo && " - "}
                {filters.dateTo && formatDate(filters.dateTo)}
                <button
                  onClick={() => setFilters({ ...filters, dateFrom: null, dateTo: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredNotes.length} catatan
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Memuat catatan...</div>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <StickyNote className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {note.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {note.author.full_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeTime(note.created_at)}
                    </span>
                    {note.contact && (
                      <span className="text-primary hover:underline cursor-pointer">
                        <a href={`/contacts/${note.contact.id}`}>
                          Kontak: {note.contact.first_name} {note.contact.last_name || ""}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Belum ada catatan
          </h3>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {hasActiveFilters 
              ? "Tidak ada catatan yang sesuai dengan filter"
              : "Catatan akan muncul di sini setelah ditambahkan dari sidebar extension"
            }
          </p>
        </div>
      )}
    </div>
  );
}
