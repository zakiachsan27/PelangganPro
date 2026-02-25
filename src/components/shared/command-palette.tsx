"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Users, Building2, Handshake, LayoutDashboard, Settings, CheckSquare, TicketCheck, UserPlus, PieChart, Megaphone, TrendingUp, Loader2 } from "lucide-react";

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals & Pipeline", href: "/deals", icon: Handshake },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Tickets", href: "/tickets", icon: TicketCheck },
  { name: "Leads", href: "/leads", icon: UserPlus },
  { name: "Segmen Pelanggan", href: "/segments", icon: PieChart },
  { name: "Broadcast", href: "/broadcast", icon: Megaphone },
  { name: "Customer Insight", href: "/insights", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SearchContact {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
}

interface SearchCompany {
  id: string;
  name: string;
}

interface SearchDeal {
  id: string;
  title: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<SearchContact[]>([]);
  const [companies, setCompanies] = useState<SearchCompany[]>([]);
  const [deals, setDeals] = useState<SearchDeal[]>([]);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const searchData = useCallback(async (q: string) => {
    if (!q.trim()) {
      setContacts([]);
      setCompanies([]);
      setDeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        fetch(`/api/contacts?search=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()),
        fetch(`/api/companies?search=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()),
        fetch(`/api/deals?search=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()),
      ]);
      setContacts(contactsRes.data || contactsRes || []);
      setCompanies(companiesRes.data || companiesRes || []);
      setDeals(dealsRes.data || dealsRes || []);
    } catch {
      setContacts([]);
      setCompanies([]);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchData(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchData]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults = contacts.length > 0 || companies.length > 0 || deals.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <CommandInput
        placeholder="Cari kontak, deal, perusahaan, atau halaman..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Mencari...</span>
          </div>
        ) : (
          <>
            {!hasResults && query.trim() && (
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            )}
            {!query.trim() && (
              <CommandEmpty>Ketik untuk mencari...</CommandEmpty>
            )}

            <CommandGroup heading="Halaman">
              {pages.map((page) => (
                <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
                  <page.icon className="mr-2 h-4 w-4" />
                  {page.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {contacts.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Contacts">
                  {contacts.map((c) => {
                    const name = `${c.first_name} ${c.last_name || ""}`.trim();
                    return (
                      <CommandItem key={c.id} onSelect={() => navigate(`/contacts/${c.id}`)}>
                        <Users className="mr-2 h-4 w-4" />
                        {name}
                        {c.email && (
                          <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}

            {companies.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Companies">
                  {companies.map((c) => (
                    <CommandItem key={c.id} onSelect={() => navigate(`/companies/${c.id}`)}>
                      <Building2 className="mr-2 h-4 w-4" />
                      {c.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {deals.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Deals">
                  {deals.map((d) => (
                    <CommandItem key={d.id} onSelect={() => navigate(`/deals/${d.id}`)}>
                      <Handshake className="mr-2 h-4 w-4" />
                      {d.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
