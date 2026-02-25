import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "Nama depan wajib diisi"),
  last_name: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  position: z.string().optional(),
  company_id: z.string().optional(),
  source: z.enum(["whatsapp", "instagram", "web", "referral", "tokopedia", "shopee", "import", "manual"]).optional(),
  status: z.enum(["lead", "active", "inactive", "customer"]),
  owner_id: z.string().optional(),
  city: z.string().optional(),
  tag_ids: z.array(z.string()).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const companySchema = z.object({
  name: z.string().min(1, "Nama perusahaan wajib diisi"),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export const dealSchema = z.object({
  title: z.string().min(1, "Judul deal wajib diisi"),
  value: z.number().min(0, "Nilai tidak boleh negatif"),
  pipeline_id: z.string().min(1, "Pipeline wajib dipilih"),
  stage_id: z.string().min(1, "Stage wajib dipilih"),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
  owner_id: z.string().optional(),
  expected_close_date: z.string().optional(),
  tag_ids: z.array(z.string()).optional(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Judul task wajib diisi"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]),
  assignee_id: z.string().optional(),
  contact_id: z.string().optional(),
  deal_id: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const noteSchema = z.object({
  content: z.string().min(1, "Catatan tidak boleh kosong"),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const ticketSchema = z.object({
  title: z.string().min(1, "Judul ticket wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.enum(["bug", "feature_request", "pertanyaan", "keluhan_pelanggan", "internal"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]),
  assignee_id: z.string().optional(),
  contact_id: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

export const ticketCommentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
});

export type TicketCommentFormValues = z.infer<typeof ticketCommentSchema>;
