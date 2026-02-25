"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { BroadcastStats } from "@/components/broadcast/broadcast-stats";
import { CampaignList } from "@/components/broadcast/campaign-list";
import { CampaignForm } from "@/components/broadcast/campaign-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RfmBadge } from "@/components/segments/rfm-badge";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { TemplateForm } from "@/components/broadcast/template-form";
import { toast } from "sonner";
import type { MessageTemplate } from "@/types";

export default function BroadcastPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/broadcast/templates");
      if (!res.ok) throw new Error("Gagal memuat templates");
      const json = await res.json();
      setTemplates(json.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Broadcast"
          description="Kirim pesan WhatsApp atau email ke segmen pelanggan"
        />
        <CampaignForm />
      </div>

      <BroadcastStats />

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignList />
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <TemplateForm onSuccess={fetchTemplates} />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tmpl) => {
                const ChannelIcon = tmpl.channel === "whatsapp" ? MessageSquare : Mail;
                return (
                  <Card key={tmpl.id}>
                    <CardContent className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">{tmpl.name}</h3>
                        <Badge variant="outline" className="text-xs gap-1 shrink-0">
                          <ChannelIcon className="h-3 w-3" />
                          {tmpl.channel === "whatsapp" ? "WA" : "Email"}
                        </Badge>
                      </div>
                      {tmpl.target_segment !== "all" ? (
                        <RfmBadge segment={tmpl.target_segment} className="text-[10px]" />
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Semua Segmen</Badge>
                      )}
                      {tmpl.subject && (
                        <p className="text-xs text-muted-foreground">
                          Subject: {tmpl.subject}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {tmpl.body}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                  Belum ada template. Buat template pertama Anda.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
