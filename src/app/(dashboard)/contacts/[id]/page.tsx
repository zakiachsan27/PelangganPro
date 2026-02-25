"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { ContactProfile } from "@/components/contacts/contact-profile";
import { Loader2 } from "lucide-react";
import type { Contact } from "@/types";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`/api/contacts/${id}`);
        if (res.status === 404) {
          setIs404(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setContact(data);
        } else {
          setIs404(true);
        }
      } catch {
        setIs404(true);
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [id]);

  if (is404) {
    notFound();
  }

  if (loading || !contact) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ContactProfile contact={contact} />;
}
