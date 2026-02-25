"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Organization } from "@/types";

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Get current user's org_id from profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Tidak terautentikasi");

        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (!profile?.org_id) throw new Error("Organisasi tidak ditemukan");

        const { data: orgData, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.org_id)
          .single();

        if (error) throw error;
        if (orgData) setOrg(orgData as Organization);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat organisasi");
      } finally {
        setLoading(false);
      }
    }
    fetchOrg();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Informasi Organisasi</CardTitle>
            <Badge variant="secondary">{(org?.plan_tier || "free").toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Nama Organisasi</Label>
            <Input id="org-name" defaultValue={org?.name || ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" defaultValue={org?.slug || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Jakarta" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Ganti Logo
            </Button>
          </div>
          <Button>Simpan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
