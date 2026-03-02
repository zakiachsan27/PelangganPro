"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, Loader2, FolderOpen, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "invoice", name: "Invoice", icon: "📄", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "penawaran", name: "Surat Penawaran", icon: "📋", color: "bg-green-100 text-green-700 border-green-200" },
  { id: "struk", name: "Struk Kasir", icon: "🧾", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "product_plan", name: "Product Plan", icon: "📊", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "custom", name: "Kategori Baru", icon: "➕", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export default function UploadTemplatePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    if (!selectedCategory) {
      toast.error("Pilih kategori template");
      return;
    }

    if (selectedCategory === "custom" && !newCategoryName.trim()) {
      toast.error("Masukkan nama kategori baru");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", selectedCategory);
      if (selectedCategory === "custom") {
        formData.append("newCategoryName", newCategoryName);
      }

      // Upload to storage
      const res = await fetch("/api/documents/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      
      // TODO: Trigger AI analysis
      toast.success("File berhasil diupload! AI akan menganalisis dokumen...");
      
      // Redirect to documents page
      router.push("/documents");
    } catch (error) {
      toast.error("Gagal upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/documents")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Upload Template Referensi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Dokumen Referensi</CardTitle>
          <CardDescription>
            Upload dokumen contoh (PDF, DOCX, atau gambar) untuk membuat template baru dengan AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Pilih Kategori Template
            </Label>
            <p className="text-sm text-muted-foreground">
              Pilih kategori yang sesuai dengan dokumen yang akan Anda upload
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{category.name}</p>
                    </div>
                    {selectedCategory === category.id && (
                      <div className="text-blue-500 shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* New Category Input */}
            {selectedCategory === "custom" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Label htmlFor="new-category" className="flex items-center gap-2 mb-2">
                  <Plus className="h-4 w-4" />
                  Nama Kategori Baru
                </Label>
                <Input
                  id="new-category"
                  placeholder="Contoh: Surat Kontrak, Nota Pengiriman, dll"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Kategori baru akan dibuat dan template ini akan menjadi referensi untuk kategori tersebut
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200" />

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File Referensi
            </Label>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {file ? file.name : "Klik untuk upload file"}
              </p>
              <p className="text-sm text-muted-foreground">
                Support: PDF, DOCX, PNG, JPG (Max 10MB)
              </p>
            </label>
          </div>

           {file && (
             <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
               <FileText className="h-5 w-5 text-blue-500" />
               <span className="flex-1 truncate">{file.name}</span>
               <span className="text-sm text-muted-foreground">
                 {(file.size / 1024 / 1024).toFixed(2)} MB
               </span>
             </div>
           )}
           </div>
 
           <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/documents")}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload & Analisis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cara Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Upload dokumen referensi (contoh: invoice, surat, struk)</li>
            <li>AI akan menganalisis layout, warna, dan struktur dokumen</li>
            <li>Sistem akan membuat template HTML yang mirip</li>
            <li>Template baru akan tersedia di menu Dokumen</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
