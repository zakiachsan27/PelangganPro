"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Contact } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { ContactGroup, Contact as ContactType } from "@/types";

const schedulerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  message: z.string().min(1, "Pesan wajib diisi"),
  target_type: z.enum(["contacts", "group"]),
  target_group_id: z.string().optional(),
  target_contacts: z.array(z.string()).optional(),
  interval_seconds: z.number().min(45, "Minimal 45 detik"),
});

type SchedulerFormValues = z.infer<typeof schedulerSchema>;

interface SchedulerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SchedulerForm({ open, onOpenChange, onSuccess }: SchedulerFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [targetType, setTargetType] = useState<"contacts" | "group">("group");

  const form = useForm<SchedulerFormValues>({
    resolver: zodResolver(schedulerSchema),
    defaultValues: {
      name: "",
      message: "",
      target_type: "group",
      interval_seconds: 45,
      target_contacts: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchGroups();
      fetchContacts();
    }
  }, [open]);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/contact-groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat grup");
    }
  }

  async function fetchContacts() {
    try {
      const res = await fetch("/api/contacts?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat kontak");
    }
  }

  async function onSubmit(data: SchedulerFormValues) {
    try {
      setSubmitting(true);

      // Validation
      if (data.target_type === "group" && !data.target_group_id) {
        toast.error("Pilih grup kontak");
        setSubmitting(false);
        return;
      }

      if (data.target_type === "contacts" && (!data.target_contacts || data.target_contacts.length === 0)) {
        toast.error("Pilih minimal 1 kontak");
        setSubmitting(false);
        return;
      }

      const payload = {
        name: data.name,
        message: data.message,
        target_type: data.target_type,
        target_group_id: data.target_type === "group" ? data.target_group_id : undefined,
        target_contacts: data.target_type === "contacts" ? data.target_contacts : undefined,
        interval_seconds: data.interval_seconds,
      };

      const res = await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal membuat jadwal");
      }

      toast.success("Jadwal berhasil dibuat");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat jadwal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Jadwal Pengiriman Baru</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Jadwal *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Promo Bulan Agustus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan WhatsApp *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tulis pesan yang akan dikirim..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Target Pengiriman *</FormLabel>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={targetType === "group" ? "default" : "outline"}
                  onClick={() => {
                    setTargetType("group");
                    form.setValue("target_type", "group");
                  }}
                  className="flex-1"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Grup Kontak
                </Button>
                <Button
                  type="button"
                  variant={targetType === "contacts" ? "default" : "outline"}
                  onClick={() => {
                    setTargetType("contacts");
                    form.setValue("target_type", "contacts");
                  }}
                  className="flex-1"
                >
                  <Contact className="mr-2 h-4 w-4" />
                  Kontak Individual
                </Button>
              </div>

              {targetType === "group" ? (
                <FormField
                  control={form.control}
                  name="target_group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Grup</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih grup kontak" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.contact_count} kontak)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="target_contacts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Kontak</FormLabel>
                      <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                        {contacts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Tidak ada kontak</p>
                        ) : (
                          <div className="space-y-2">
                            {contacts.map((contact) => (
                              <div key={contact.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value?.includes(contact.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, contact.id]);
                                    } else {
                                      field.onChange(current.filter((id) => id !== contact.id));
                                    }
                                  }}
                                />
                                <label className="text-sm">
                                  {contact.first_name} {contact.last_name} 
                                  <span className="text-muted-foreground">({contact.phone || contact.whatsapp})</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="interval_seconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval Pengiriman (detik) *</FormLabel>
                  <Select 
                    onValueChange={(v) => field.onChange(parseInt(v))} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="45">45 detik</SelectItem>
                      <SelectItem value="60">1 menit</SelectItem>
                      <SelectItem value="90">1.5 menit</SelectItem>
                      <SelectItem value="120">2 menit</SelectItem>
                      <SelectItem value="180">3 menit</SelectItem>
                      <SelectItem value="300">5 menit</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Interval random: {Math.floor((field.value || 45) * 0.75)}-{field.value || 45} detik
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan & Mulai Nanti
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
