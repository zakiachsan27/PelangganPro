"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Chrome, Download, Info, CheckCircle } from "lucide-react";

export default function ExtensionSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chrome Extension</h2>
        <p className="text-muted-foreground">
          Integrasi WhatsApp Web dengan CRM melalui Chrome Extension
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cara Kerja Extension</AlertTitle>
        <AlertDescription>
          Extension ini menambahkan sidebar CRM di sebelah kanan WhatsApp Web. 
          Anda bisa melihat data kontak, menambahkan catatan, mengubah pipeline stage, 
          dan membuat reminder tanpa meninggalkan WhatsApp.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5" />
              Install Extension
            </CardTitle>
            <CardDescription>
              Install extension dari Chrome Web Store atau manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Cara Install (Manual):</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Download extension dari folder <code>extension/dist</code></li>
                <li>Buka Chrome → Extensions → Developer mode ON</li>
                <li>Click &quot;Load unpacked&quot; → Pilih folder <code>extension/dist</code></li>
                <li>Extension akan muncul di toolbar Chrome</li>
              </ol>
            </div>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Extension Files
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status Koneksi
            </CardTitle>
            <CardDescription>
              Status koneksi extension dengan CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auth Status</span>
                <span className="font-medium text-green-600">● Terautentikasi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Extension Version</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Endpoint</span>
                <span className="font-medium">{process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fitur Extension</CardTitle>
          <CardDescription>
            Apa saja yang bisa dilakukan melalui extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="mt-0.5">{feature.icon}</div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>
            Masalah umum dan solusinya
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {troubleshooting.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="font-medium text-sm">{item.problem}</p>
              <p className="text-sm text-muted-foreground">{item.solution}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const features = [
  {
    title: "Lihat Data Kontak",
    description: "Nama, tags, dan informasi kontak langsung di sidebar",
    icon: "👤",
  },
  {
    title: "Pipeline & Deal",
    description: "Lihat stage aktif dan nilai deal",
    icon: "📊",
  },
  {
    title: "Catatan (Notes)",
    description: "Tambah dan lihat 5 catatan terbaru",
    icon: "📝",
  },
  {
    title: "Ubah Stage",
    description: "Pindahkan deal ke stage lain",
    icon: "🔄",
  },
  {
    title: "Assign ke Agent",
    description: "Tugaskan kontak ke sales/agent",
    icon: "👥",
  },
  {
    title: "Reminder",
    description: "Buat task/reminder untuk follow up",
    icon: "⏰",
  },
];

const troubleshooting = [
  {
    problem: "Extension menunjukkan 'Belum Login'",
    solution: "Pastikan Anda sudah login ke CRM di tab yang sama. Extension membaca session dari CRM.",
  },
  {
    problem: "Data kontak tidak muncul",
    solution: "Pastikan nomor WhatsApp sudah terdaftar di menu Contacts CRM dengan format yang benar.",
  },
  {
    problem: "Sidebar tidak muncul di WhatsApp Web",
    solution: "Refresh halaman WhatsApp Web (F5). Jika masih tidak muncul, cek apakah extension aktif di chrome://extensions",
  },
];
