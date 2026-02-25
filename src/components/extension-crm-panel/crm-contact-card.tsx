"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, ExternalLink, UserPlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkContactDialog } from "@/components/messaging/link-contact-dialog";
import { getInitials } from "@/lib/format";
import type { Contact } from "@/types";

interface CrmContactCardProps {
  contactId: string | null;
}

export function CrmContactCard({ contactId }: CrmContactCardProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) {
      setContact(null);
      return;
    }
    setLoading(true);
    fetch(`/api/contacts/${contactId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setContact(data))
      .catch(() => setContact(null))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (!contactId) {
    return (
      <>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">Kontak belum terhubung</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Link to Contact
          </Button>
        </div>
        <LinkContactDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contact) return null;

  const name = `${contact.first_name} ${contact.last_name || ""}`.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          {contact.position && (
            <p className="text-xs text-muted-foreground truncate">{contact.position}</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={`text-xs shrink-0 ${
            contact.status === "customer"
              ? "border-success/30 text-success-foreground"
              : contact.status === "lead"
              ? "border-warning/30 text-warning-foreground"
              : ""
          }`}
        >
          {contact.status}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {(contact.phone || contact.whatsapp) && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{contact.phone || contact.whatsapp}</span>
          </div>
        )}
      </div>

      <Link href={`/contacts/${contact.id}`}>
        <Button variant="outline" size="sm" className="w-full">
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Lihat Profil
        </Button>
      </Link>
    </div>
  );
}
