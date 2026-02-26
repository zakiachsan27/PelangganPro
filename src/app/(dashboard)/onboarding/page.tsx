"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Chrome, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  LogIn, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    id: "install",
    title: "Install Extension",
    description: "Tambahkan PelangganPro ke browser Chrome Anda",
    icon: Download,
  },
  {
    id: "whatsapp",
    title: "Buka WhatsApp Web",
    description: "Akses WhatsApp Web untuk mulai menggunakan extension",
    icon: MessageCircle,
  },
  {
    id: "login",
    title: "Login di Extension",
    description: "Hubungkan extension dengan akun CRM Anda",
    icon: LogIn,
  },
  {
    id: "gunakan",
    title: "Mulai Menggunakan",
    description: "Nikmati fitur lengkap PelangganPro di WhatsApp",
    icon: Sparkles,
  },
];

export default function OnboardingPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("install");

  const handleCopyExtensionId = () => {
    // Ganti dengan extension ID yang sebenarnya
    navigator.clipboard.writeText("pelangganpro-extension-id");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">
          Panduan Pengguna Baru
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Selamat Datang di PelangganPro! 🎉
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          PelangganPro adalah CRM terintegrasi WhatsApp yang membantu Anda mengelola 
          pelanggan, deal, dan tugas langsung dari WhatsApp Web.
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeTab === step.id;
              const isPast = steps.findIndex(s => s.id === activeTab) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTab(step.id)}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isPast
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[120px]">
                        {step.description}
                      </p>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block w-16 h-px bg-border mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="gunakan">Mulai</TabsTrigger>
        </TabsList>

        {/* Step 1: Install Extension */}
        <TabsContent value="install" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5" />
                Install Chrome Extension
              </CardTitle>
              <CardDescription>
                Extension PelangganPro diperlukan untuk mengintegrasikan CRM dengan WhatsApp Web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Download Extension</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download file extension dalam format .zip atau dapatkan dari tim developer
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Download Extension (Developer Mode)
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Ekstrak File</p>
                    <p className="text-sm text-muted-foreground">
                      Ekstrak file .zip yang sudah didownload ke folder di komputer Anda
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Buka Chrome Extensions</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Buka Chrome dan kunjungi halaman extensions atau klik link berikut:
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="chrome://extensions/" target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Buka chrome://extensions/
                      </Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Aktifkan Developer Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Aktifkan toggle "Developer mode" di pojok kanan atas halaman extensions
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">5</span>
                  </div>
                  <div>
                    <p className="font-medium">Load Extension</p>
                    <p className="text-sm text-muted-foreground">
                      Klik tombol "Load unpacked" dan pilih folder hasil ekstrak extension
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">💡 Tips</p>
                <p className="text-sm text-muted-foreground">
                  Pastikan icon PelangganPro muncul di toolbar Chrome Anda. Jika tidak terlihat, 
                  klik icon puzzle 🧩 di toolbar dan pin PelangganPro.
                </p>
              </div>

              <Button onClick={() => setActiveTab("whatsapp")} className="w-full">
                Lanjut ke Step 2
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: WhatsApp Web */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Akses WhatsApp Web
              </CardTitle>
              <CardDescription>
                Extension PelangganPro berjalan di WhatsApp Web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Buka WhatsApp Web</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Kunjungi web.whatsapp.com di Chrome dan scan QR code dengan WhatsApp HP Anda
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="https://web.whatsapp.com" target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Buka web.whatsapp.com
                      </Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Pastikan Extension Aktif</p>
                    <p className="text-sm text-muted-foreground">
                      Setelah WhatsApp Web terbuka, extension akan otomatis aktif dan 
                      menampilkan icon PelangganPro di pojok kanan bawah layar
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Buka Sidebar PelangganPro</p>
                    <div className="text-sm text-muted-foreground">
                      Klik icon PelangganPro di pojok kanan bawah untuk membuka sidebar. 
                      Sidebar akan menampilkan kolom pencarian kontak.
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Ketik nama atau nomor kontak di kolom pencarian</li>
                        <li>Klik kontak yang ingin Anda lihat detailnya</li>
                        <li>Data kontak akan muncul di sidebar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">⚠️ Catatan Penting</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Pastikan Anda login di WhatsApp Web sebelum menggunakan extension</li>
                  <li>Extension hanya berfungsi di Chrome browser</li>
                  <li>Jangan tutup tab CRM (pelangganpro.com) saat menggunakan extension</li>
                </ul>
              </div>

              <Button onClick={() => setActiveTab("login")} className="w-full">
                Lanjut ke Step 3
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Login */}
        <TabsContent value="login" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Login di Extension
              </CardTitle>
              <CardDescription>
                Masuk ke extension dengan akun CRM Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Buka Sidebar PelangganPro</p>
                    <p className="text-sm text-muted-foreground">
                      Di WhatsApp Web, klik icon PelangganPro di pojok kanan bawah 
                      untuk membuka sidebar extension.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Klik Tombol Login</p>
                    <p className="text-sm text-muted-foreground">
                      Di bagian atas sidebar, klik tombol "Login" atau "Masuk" 
                      untuk membuka form login.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Masukkan Kredensial</p>
                    <div className="text-sm text-muted-foreground">
                      Masukkan email dan password yang sama dengan akun PelangganPro Anda:
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Email: Gunakan email yang terdaftar di CRM</li>
                        <li>Password: Password akun PelangganPro Anda</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Cek Status Login</p>
                    <p className="text-sm text-muted-foreground">
                      Jika berhasil login, Anda akan melihat nama dan organisasi Anda 
                      di bagian atas sidebar extension, dan form login akan tertutup.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  🔐 Troubleshooting Login
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Pastikan email dan password sudah benar</li>
                  <li>Pastikan akun sudah aktif dan terverifikasi</li>
                  <li>Refresh halaman WhatsApp Web jika login gagal</li>
                  <li>Periksa koneksi internet Anda</li>
                </ul>
              </div>

              <Button onClick={() => setActiveTab("gunakan")} className="w-full">
                Lanjut ke Step 4
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Mulai Menggunakan */}
        <TabsContent value="gunakan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Fitur Utama PelangganPro
              </CardTitle>
              <CardDescription>
                Pelajari fitur-fitur yang tersedia di extension
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">👤 Data Kontak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Lihat profil lengkap kontak termasuk status, perusahaan, 
                      lifetime value, dan deal yang sedang berjalan.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">📝 Catatan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tambah dan lihat riwayat catatan untuk setiap kontak. 
                      Semua catatan tersinkronisasi dengan dashboard CRM.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">🎫 Tiket</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Buat dan kelola tiket support langsung dari chat WhatsApp. 
                      Pantau status tiket dengan mudah.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">⏰ Pengingat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Buat pengingat tugas untuk follow-up pelanggan. 
                      Jadwal tugas muncul otomatis di dashboard.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">🔄 Pipeline Deal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Pantau dan update status deal di pipeline. 
                      Pindahkan deal antar stage dengan mudah.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-pink-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">🏷️ Tag & Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tambah tag untuk kategorisasi kontak dan assign 
                      kontak ke tim sales Anda.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Tips Penggunaan</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Sidebar otomatis terbuka saat Anda membuka chat di WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Kontak baru akan otomatis tercatat sebagai Lead saat pertama kali chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Semua data tersinkronisasi real-time dengan dashboard CRM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Gunakan tombol "Buka di CRM" untuk melihat detail lengkap di dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href="/dashboard">
                    Ke Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="https://web.whatsapp.com" target="_blank">
                    Buka WhatsApp Web
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Butuh bantuan lebih lanjut? Hubungi tim support kami.</p>
      </div>
    </div>
  );
}
