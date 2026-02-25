"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, Plus, Eye, Loader2 } from "lucide-react";
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
import { TemplatePicker } from "./template-picker";
import { RFM_SEGMENTS, RFM_SEGMENT_LABELS } from "@/lib/rfm";
import type { BroadcastChannel, RfmSegment, MessageTemplate } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const variables = ["{{nama}}", "{{email}}", "{{nama_toko}}", "{{diskon}}", "{{kode}}", "{{batas_waktu}}"];

interface SegmentStat {
  segment: RfmSegment;
  count: number;
  totalRevenue: number;
  avgLtv: number;
}

interface CampaignFormProps {
  onSuccess?: () => void;
}

export function CampaignForm({ onSuccess }: CampaignFormProps) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<BroadcastChannel>("whatsapp");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<RfmSegment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [segmentStats, setSegmentStats] = useState<SegmentStat[]>([]);

  useEffect(() => {
    fetch("/api/segments/stats")
      .then((res) => res.json())
      .then((data: SegmentStat[]) => setSegmentStats(data))
      .catch(() => {});
  }, []);

  function getCount(seg: RfmSegment): number {
    return segmentStats.find((s) => s.segment === seg)?.count ?? 0;
  }

  const targetCount = selectedSegments.reduce((sum, seg) => sum + getCount(seg), 0);

  function toggleSegment(seg: RfmSegment) {
    setSelectedSegments((prev) =>
      prev.includes(seg) ? prev.filter((s) => s !== seg) : [...prev, seg]
    );
  }

  function insertVariable(variable: string) {
    setBody((prev) => prev + variable);
  }

  function handleTemplateSelect(template: MessageTemplate) {
    setBody(template.body);
    if (template.subject) setSubject(template.subject);
    if (template.target_segment !== "all") {
      setSelectedSegments([template.target_segment]);
    }
  }

  async function handleSubmit(status: "draft" | "sent") {
    if (!name || !body || selectedSegments.length === 0) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/broadcast/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          channel,
          subject: channel === "email" ? subject : null,
          message_body: body,
          target_segments: selectedSegments,
          target_count: targetCount,
          status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal membuat campaign");
      }
      toast.success(status === "draft" ? "Disimpan sebagai draft" : "Campaign berhasil dikirim");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat campaign");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setSubject("");
    setBody("");
    setSelectedSegments([]);
    setShowPreview(false);
  }

  const previewBody = body
    .replace(/\{\{nama\}\}/g, "Rina Wulandari")
    .replace(/\{\{email\}\}/g, "rina.w@majubersama.co.id")
    .replace(/\{\{nama_toko\}\}/g, "Toko Sejahtera Digital")
    .replace(/\{\{diskon\}\}/g, "15")
    .replace(/\{\{kode\}\}/g, "PROMO15")
    .replace(/\{\{batas_waktu\}\}/g, "28 Feb 2026");

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Campaign Baru</DialogTitle>
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

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="campaign-name" className="text-xs">Nama Campaign *</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Promo Akhir Bulan"
            />
          </div>

          {/* Subject (email only) */}
          {channel === "email" && (
            <div className="space-y-1.5">
              <Label htmlFor="campaign-subject" className="text-xs">Subject Email</Label>
              <Input
                id="campaign-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject email"
              />
            </div>
          )}

          {/* Target Segments */}
          <div className="space-y-1.5">
            <Label className="text-xs">Target Segmen *</Label>
            <div className="flex flex-wrap gap-2">
              {RFM_SEGMENTS.map((seg) => {
                const isSelected = selectedSegments.includes(seg.key);
                return (
                  <button
                    key={seg.key}
                    type="button"
                    onClick={() => toggleSegment(seg.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted"
                    )}
                  >
                    {RFM_SEGMENT_LABELS[seg.key]} ({getCount(seg.key)})
                  </button>
                );
              })}
            </div>
            {selectedSegments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Total penerima: <span className="font-medium">{targetCount}</span>
              </p>
            )}
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="campaign-body" className="text-xs">Pesan *</Label>
              <div className="flex gap-1.5">
                <TemplatePicker channel={channel} onSelect={handleTemplateSelect} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>
            </div>

            {showPreview ? (
              <div className="rounded-lg border bg-muted/30 p-4 min-h-[120px]">
                <p className="text-xs text-muted-foreground mb-2">Preview (data contoh):</p>
                <div className="text-sm whitespace-pre-wrap">{previewBody || "Tulis pesan terlebih dahulu..."}</div>
              </div>
            ) : (
              <Textarea
                id="campaign-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis pesan broadcast Anda..."
                rows={5}
              />
            )}

            {/* Variable Buttons */}
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
            <Button type="button" variant="secondary" onClick={() => handleSubmit("draft")} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Draft
            </Button>
            <Button type="button" onClick={() => handleSubmit("sent")} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Sekarang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
