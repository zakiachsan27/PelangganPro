"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "@/components/deals/deal-form";
import { toast } from "sonner";
import type { Contact } from "@/types";

function NewDealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contact_id");
  
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [formOpen, setFormOpen] = useState(true);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    } else {
      setLoading(false);
      setFormOpen(true);
    }
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setContact(data);
      }
    } catch (error) {
      toast.error("Gagal memuat data kontak");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success("Deal berhasil dibuat!");
    if (contactId) {
      // If came from contact/leads page, go back to deals list
      router.push("/deals");
    } else {
      router.push("/deals");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={contactId ? `/contacts/${contactId}` : "/leads"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Convert to Deal</h1>
          <p className="text-sm text-muted-foreground">
            {contact ? `Membuat deal untuk ${contact.first_name} ${contact.last_name || ""}` : "Buat deal baru"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) {
                router.push(contactId ? `/contacts/${contactId}` : "/leads");
              }
            }}
            defaultContactId={contactId || undefined}
            onSuccess={handleSuccess}
          />
          
          {/* Since DealForm is a dialog, we need to trigger it differently */}
          {/* Alternative: Show form directly without dialog */}
          <p className="text-sm text-muted-foreground text-center py-8">
            Form deal akan muncul di dialog. Pastikan popup tidak diblokir.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => setFormOpen(true)}>
              Buka Form Deal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewDealPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewDealContent />
    </Suspense>
  );
}
