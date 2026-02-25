"use client";

import { useState } from "react";
import { Mail, MessageSquare, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RFM_SEGMENTS, RFM_SEGMENT_LABELS } from "@/lib/rfm";
import type { BroadcastChannel, RfmSegment } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const variables = ["{{nama}}", "{{email}}", "{{nama_toko}}", "{{diskon}}", "{{kode}}", "{{batas_waktu}}"];

interface TemplateFormProps {
  onSuccess?: () => void;
}

export function TemplateForm({ onSuccess }: TemplateFormProps) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<BroadcastChannel>("whatsapp");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetSegment, setTargetSegment] = useState<RfmSegment | "all">("all");
  const [submitting, setSubmitting] = useState(false);

  function insertVariable(variable: string) {
    setBody((prev) => prev + variable);
  }

  async function handleSubmit() {
    if (!name || !body) {
      toast.error("Nama template dan isi pesan wajib diisi");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/broadcast/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          channel,
          subject: channel === "email" ? subject : null,
          body,
          target_segment: targetSegment,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan template");
      }
      toast.success("Template berhasil disimpan");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan template");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setSubject("");
    setBody("");
    setChannel("whatsapp");
    setTargetSegment("all");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Buat Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Template Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel Toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs">Channel</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={channel === "whatsapp" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setChannel("whatsapp")}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
              <Button
                type="button"
                variant={channel === "email" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setChannel("email")}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </Button>
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-1.5">
            <Label htmlFor="template-name" className="text-xs">Nama Template *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Promo Akhir Tahun"
            />
          </div>

          {/* Subject (email only) */}
          {channel === "email" && (
            <div className="space-y-1.5">
              <Label htmlFor="template-subject" className="text-xs">Subject Email</Label>
              <Input
                id="template-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject email"
              />
            </div>
          )}

          {/* Target Segment */}
          <div className="space-y-1.5">
            <Label className="text-xs">Target Segmen</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTargetSegment("all")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  targetSegment === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                Semua Segmen
              </button>
              {RFM_SEGMENTS.map((seg) => (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setTargetSegment(seg.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    targetSegment === seg.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  {RFM_SEGMENT_LABELS[seg.key]}
                </button>
              ))}
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <Label htmlFor="template-body" className="text-xs">Isi Pesan *</Label>
            <Textarea
              id="template-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi template pesan..."
              rows={5}
            />
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Variabel:</span>
              {variables.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted text-xs"
                  onClick={() => insertVariable(v)}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={submitting}>
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
