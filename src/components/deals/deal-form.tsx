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
import { CurrencyInput } from "@/components/ui/currency-input";
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
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<DealFormValues>(({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      value: 0,
      pipeline_id: "",
      stage_id: "",
      contact_id: "",
      company_id: "",
      owner_id: "",
      expected_close_date: "",
      tag_ids: [],
    },
  }));

  // Reset form when deal changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: deal?.title || "",
        value: deal?.value || 0,
        pipeline_id: deal?.pipeline_id || "",
        stage_id: deal?.stage_id || defaultStageId || "",
        contact_id: deal?.contact_id || defaultContactId || "",
        company_id: deal?.company_id || "",
        owner_id: deal?.owner_id || "",
        expected_close_date: deal?.expected_close_date || "",
        tag_ids: deal?.tags?.map((t) => t.id) || [],
      });
    }
  }, [open, deal, defaultStageId, defaultContactId, form]);

  // Fetch data in background
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      try {
        const [pipelinesRes, contactsRes, companiesRes] = await Promise.all([
          fetch("/api/pipelines"),
          fetch("/api/contacts?limit=50"),
          fetch("/api/companies?limit=50"),
        ]);

        if (cancelled) return;

        if (pipelinesRes.ok) {
          const pipelinesData: Pipeline[] = await pipelinesRes.json();
          setPipelines(pipelinesData);
        }

        if (contactsRes.ok) {
          const contactsJson = await contactsRes.json();
          setContacts(contactsJson.data || []);
        }

        if (companiesRes.ok) {
          const companiesJson = await companiesRes.json();
          setCompanies(companiesJson.data || []);
        }

        // Fetch profiles - all active team members from same org
        try {
          const supabase = createSupabaseBrowserClient();
          
          // Get current user's org_id first
          const { data: currentProfile } = await supabase
            .from("profiles")
            .select("org_id")
            .eq("id", (await supabase.auth.getUser()).data.user?.id)
            .single();
          
          if (currentProfile?.org_id) {
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("org_id", currentProfile.org_id)
              .eq("is_active", true)
              .order("full_name");

            if (profilesError) {
              console.error("Failed to fetch profiles:", profilesError);
            }

            if (!cancelled) {
              setUsers(profiles as Profile[] || []);
            }
          } else {
            console.error("Could not determine org_id for current user");
            if (!cancelled) {
              setUsers([]);
            }
          }
        } catch (profileErr) {
          console.error("Error fetching profiles:", profileErr);
          if (!cancelled) {
            setUsers([]);
          }
        }
      } catch (err) {
        console.error("Failed to load form data:", err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const contactOptions = contacts.map((c) => ({
    value: c.id,
    label: `${c.first_name} ${c.last_name || ""}`.trim(),
  }));
  const companyOptions = companies.map((c) => ({ value: c.id, label: c.name }));
  const ownerOptions = users.map((u) => ({ value: u.id, label: u.full_name }));

  async function onSubmit(data: DealFormValues) {
    setLoading(true);
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
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan deal");
    } finally {
      setLoading(false);
    }
  }

  // Get stages for selected pipeline
  const watchedPipelineId = form.watch("pipeline_id");
  const currentPipeline = pipelines.find((p) => p.id === watchedPipelineId);
  const allStages = currentPipeline?.stages || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Tambah Deal"}</DialogTitle>
        </DialogHeader>

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
                    <CurrencyInput
                      placeholder="25.000.000"
                      value={field.value}
                      onChange={field.onChange}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allStages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                              {s.is_won && <span className="text-[10px] text-green-600">(Won)</span>}
                              {s.is_lost && <span className="text-[10px] text-red-600">(Lost)</span>}
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
                    <FormLabel>Assign Contact</FormLabel>
                    <FormControl>
                      {users.length === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Tidak ada data user
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.reload()}
                          >
                            Refresh
                          </Button>
                        </div>
                      ) : (
                        <Combobox
                          options={ownerOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Pilih assign contact"
                          searchPlaceholder="Cari assign contact..."
                        />
                      )}
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
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update" : "Tambah"} Deal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
