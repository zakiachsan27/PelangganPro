"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { TagPicker } from "@/components/tags/tag-picker";
import { dealSchema, type DealFormValues } from "@/lib/validations";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Deal, Pipeline, Contact, Company, Profile } from "@/types";

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultStageId?: string;
  defaultContactId?: string;
  onSuccess?: () => void;
}

export function DealForm({ open, onOpenChange, deal, defaultStageId, defaultContactId, onSuccess }: DealFormProps) {
  const isEdit = !!deal;

  // Fetched data state
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title || "",
      value: deal?.value || 0,
      pipeline_id: deal?.pipeline_id || "",
      stage_id: deal?.stage_id || defaultStageId || "",
      contact_id: deal?.contact_id || defaultContactId || "",
      company_id: deal?.company_id || "",
      owner_id: deal?.owner_id || "",
      expected_close_date: deal?.expected_close_date || "",
      tag_ids: deal?.tags?.map((t) => t.id) || [],
    },
  });

  const contactOptions = contacts.map((c) => ({
    value: c.id,
    label: `${c.first_name} ${c.last_name || ""}`.trim(),
  }));
  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const ownerOptions = users.map((u) => ({
    value: u.id,
    label: u.full_name,
  }));

  // Fetch options when dialog opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const [pipelinesRes, contactsRes, companiesRes] = await Promise.all([
          fetch("/api/pipelines"),
          fetch("/api/contacts?limit=50"),
          fetch("/api/companies?limit=50"),
        ]);

        // Fetch profiles via Supabase browser client
        const supabase = createSupabaseBrowserClient();
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, is_active")
          .eq("is_active", true)
          .order("full_name");

        if (cancelled) return;

        if (pipelinesRes.ok) {
          const pipelinesData: Pipeline[] = await pipelinesRes.json();
          setPipelines(pipelinesData);

          // Set default pipeline_id if not already set
          const defPipeline = pipelinesData.find((p) => p.is_default) || pipelinesData[0];
          if (defPipeline && !deal?.pipeline_id) {
            form.setValue("pipeline_id", defPipeline.id);
            const defStages = (defPipeline.stages || []).filter((s) => !s.is_won && !s.is_lost);
            if (!deal?.stage_id && !defaultStageId && defStages[0]) {
              form.setValue("stage_id", defStages[0].id);
            }
          }
        }

        if (contactsRes.ok) {
          const contactsJson = await contactsRes.json();
          setContacts(contactsJson.data || []);
        }

        if (companiesRes.ok) {
          const companiesJson = await companiesRes.json();
          setCompanies(companiesJson.data || []);
        }

        if (profilesData) {
          setUsers(profilesData as Profile[]);
        }
      } catch (err) {
        console.error("Failed to load deal form options:", err);
        toast.error("Gagal memuat opsi form");
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [open, deal, defaultStageId, form]);

  async function onSubmit(data: DealFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/deals/${deal!.id}` : "/api/deals";
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        title: data.title,
        value: data.value,
        pipeline_id: data.pipeline_id,
        stage_id: data.stage_id,
      };

      if (data.contact_id) body.contact_id = data.contact_id;
      if (data.company_id) body.company_id = data.company_id;
      if (data.owner_id) body.owner_id = data.owner_id;
      if (data.expected_close_date) body.expected_close_date = data.expected_close_date;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan deal");
      }

      toast.success(isEdit ? "Deal berhasil diupdate" : "Deal berhasil ditambahkan");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (err) {
      console.error("Deal form submit error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan deal");
    } finally {
      setSubmitting(false);
    }
  }

  // Watch pipeline_id to update stages list
  const watchedPipelineId = form.watch("pipeline_id");
  const currentPipeline = pipelines.find((p) => p.id === watchedPipelineId);
  const currentOpenStages = (currentPipeline?.stages || []).filter((s) => !s.is_won && !s.is_lost);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Tambah Deal"}</DialogTitle>
        </DialogHeader>

        {optionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Deal *</FormLabel>
                    <FormControl>
                      <Input placeholder="Supply Kertas A4 Q1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai (IDR) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pipeline_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pipeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pipelines.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stage_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentOpenStages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contact_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <FormControl>
                        <Combobox
                          options={contactOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Pilih contact"
                          searchPlaceholder="Cari contact..."
                          allowCreate
                          createLabel={(q) => `Tambah "${q}"`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Combobox
                          options={companyOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Pilih company"
                          searchPlaceholder="Cari company..."
                          allowCreate
                          createLabel={(q) => `Tambah "${q}"`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="owner_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Combobox
                          options={ownerOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Pilih owner"
                          searchPlaceholder="Cari owner..."
                          allowCreate
                          createLabel={(q) => `Tambah "${q}"`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expected_close_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Close Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tag_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagPicker
                        selectedTagIds={field.value || []}
                        onChange={field.onChange}
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
                  {isEdit ? "Update" : "Tambah"} Deal
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
