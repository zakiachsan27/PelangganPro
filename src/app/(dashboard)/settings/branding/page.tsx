"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// TODO: Replace defaults with real branding table fetch when branding table is created
const defaultBranding = {
  app_name: "PelangganPro",
  primary_color: "#6366f1",
  accent_color: "#8b5cf6",
  support_email: "",
};

export default function BrandingSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">White-Label Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Nama Aplikasi</Label>
            <Input id="app-name" defaultValue={defaultBranding.app_name} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Warna Utama</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  defaultValue={defaultBranding.primary_color}
                  className="flex-1"
                />
                <input
                  type="color"
                  defaultValue={defaultBranding.primary_color}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Warna Aksen</Label>
              <div className="flex gap-2">
                <Input
                  id="accent-color"
                  defaultValue={defaultBranding.accent_color}
                  className="flex-1"
                />
                <input
                  type="color"
                  defaultValue={defaultBranding.accent_color}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email Support</Label>
            <Input
              id="support-email"
              type="email"
              defaultValue={defaultBranding.support_email}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Upload Logo
            </Button>
            <Button variant="outline" size="sm">
              Upload Favicon
            </Button>
          </div>
          <Button>Simpan Branding</Button>
        </CardContent>
      </Card>
    </div>
  );
}
