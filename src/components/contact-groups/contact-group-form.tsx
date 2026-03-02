"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { ContactGroup } from "@/types";

const groupSchema = z.object({
  name: z.string().min(1, "Nama grup wajib diisi"),
  description: z.string().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface ContactGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ContactGroup | null;
  onSuccess?: () => void;
}

export function ContactGroupForm({ open, onOpenChange, group, onSuccess }: ContactGroupFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!group;

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
    },
  });

  async function onSubmit(data: GroupFormValues) {
    try {
      setSubmitting(true);
      const url = isEdit ? `/api/contact-groups/${group.id}` : "/api/contact-groups";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan grup");
      }

      toast.success(isEdit ? "Grup berhasil diupdate" : "Grup berhasil dibuat");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan grup");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Grup" : "Buat Grup Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Grup *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Pelanggan VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deskripsi grup (opsional)" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
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
                {isEdit ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
