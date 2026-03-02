"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, FileStack, Loader2, MoreHorizontal, Trash2, Pencil, LayoutTemplate, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DocumentTemplate, GeneratedDocument } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Categories for template editing
const CATEGORIES = [
  { id: "invoice", name: "Invoice", icon: "📄" },
  { id: "penawaran", name: "Surat Penawaran", icon: "📋" },
  { id: "struk", name: "Struk Kasir", icon: "🧾" },
  { id: "product_plan", name: "Product Plan", icon: "📊" },
  { id: "custom", name: "Kategori Baru", icon: "➕" },
];

// Sub-component for Create Document Tab
function CreateDocumentTab({ 
  templates, 
  loadingTemplates,
  getTemplateIcon,
  getTemplateColor,
  getTemplateLabel
}: {
  templates: DocumentTemplate[];
  loadingTemplates: boolean;
  getTemplateIcon: (type: string) => string;
  getTemplateColor: (type: string) => string;
  getTemplateLabel: (type: string) => string;
}) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handlePromptSubmit = () => {
    // Simple keyword matching to suggest template
    const keywords: Record<string, string[]> = {
      penawaran: ["penawaran", "offer", "quotation", "harga", "price"],
      invoice: ["invoice", "faktur", "tagihan", "bill", "payment"],
      struk: ["struk", "receipt", "kasir", "cashier", "nota"],
      product_plan: ["product", "plan", "proposal", "produk", "rencana"]
    };
    
    const lowerPrompt = prompt.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerPrompt.includes(word))) {
        const matched = templates.find(t => t.type === type);
        if (matched) {
          setSelectedTemplate(matched);
          toast.success(`Template "${matched.name}" dipilih berdasarkan prompt Anda`);
          return;
        }
      }
    }
    
    toast.info("Pilih template secara manual atau perjelas prompt Anda");
  };

  const handleCreateDocument = async () => {
    if (!selectedTemplate) {
      toast.error("Pilih template terlebih dahulu");
      return;
    }

    setIsCreating(true);
    try {
      // Generate document with AI based on prompt and template
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          title: `${selectedTemplate.name} - ${new Date().toLocaleDateString('id-ID')}`,
          data: { prompt }, // Send prompt as data for AI processing
          status: "draft"
        })
      });

      if (!res.ok) throw new Error("Failed to create document");
      
      const data = await res.json();
      toast.success("Dokumen berhasil dibuat!");
      router.push(`/documents/${data.data.id}`);
    } catch (error) {
      toast.error("Gagal membuat dokumen");
    } finally {
      setIsCreating(false);
    }
  };

  // Always show all templates, don't filter based on prompt
  const filteredTemplates = templates;

  if (loadingTemplates) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
        <LayoutTemplate className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada template</h3>
        <p className="text-sm text-slate-500 mb-4">Template default akan tersedia setelah di-setup</p>
        <Button onClick={() => router.push("/documents/upload")} variant="outline">
          Upload Template Referensi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt Section with Template Selection */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Buat Dokumen dengan AI Prompt
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deskripsikan dokumen yang ingin Anda buat, lalu pilih template yang sesuai
          </p>
          
          {/* Multiline Prompt Input */}
          <div className="relative mb-6">
            <Textarea
              placeholder="Deskripsikan detail dokumen yang ingin Anda buat...&#10;Contoh:&#10;- Saya ingin membuat surat penawaran untuk PT Maju Jaya&#10;- Tentang jasa pembuatan website company profile&#10;- Harga Rp 15.000.000&#10;- Masa pengerjaan 2 minggu&#10;- Termasuk maintenance 3 bulan"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="pr-10 resize-none"
            />
            {prompt && (
              <button 
                onClick={() => setPrompt("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Template Selection within Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Pilih Template</h4>
              {prompt && (
                <Badge variant="secondary" className="text-xs">
                  {filteredTemplates.length} template tersedia
                </Badge>
              )}
            </div>
            
            <ScrollArea className="h-[200px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-white ring-2 ring-blue-500 shadow-sm"
                        : "border-gray-200 bg-white/70 hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTemplateIcon(template.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{template.name}</span>
                          {template.is_default && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">Default</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${getTemplateColor(template.type)}`}>
                          {getTemplateLabel(template.type)}
                        </Badge>
                      </div>
                      {selectedTemplate?.id === template.id && (
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
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Create Document Button */}
      {selectedTemplate && (
        <div className="flex justify-center">
          <Button 
            size="lg"
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="px-8"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Membuat Dokumen...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Buat Dokumen dengan {selectedTemplate.name}
              </>
            )}
          </Button>
        </div>
      )}


    </div>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
  
  // Edit dialog states
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editNewCategoryName, setEditNewCategoryName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchDocuments();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/documents/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      const templatesData = data.data || [];
      
      // Auto-seed default templates if none exist
      if (templatesData.length === 0) {
        await seedDefaultTemplates();
      } else {
        setTemplates(templatesData);
      }
    } catch (error) {
      toast.error("Gagal memuat template");
    } finally {
      setLoadingTemplates(false);
    }
  }

  async function seedDefaultTemplates() {
    try {
      const res = await fetch("/api/documents/templates/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
          toast.success(`${data.count} template default berhasil dibuat`);
        }
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("[Seed Templates] Error:", error);
      setTemplates([]);
    }
  }

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!confirm("Yakin ingin menghapus template ini?")) return;
    
    setDeletingTemplate(templateId);
    try {
      const res = await fetch(`/api/documents/templates/${templateId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete template");
      
      toast.success("Template berhasil dihapus");
      fetchTemplates();
    } catch (error) {
      toast.error("Gagal menghapus template");
    } finally {
      setDeletingTemplate(null);
    }
  }

  // Open edit dialog for template
  const openEditDialog = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setEditCategory(template.type);
    setEditNewCategoryName("");
    setEditFile(null);
    setEditDialogOpen(true);
  };

  // Handle template update
  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    if (!editFile) {
      toast.error("Pilih file referensi baru");
      return;
    }

    if (editCategory === "custom" && !editNewCategoryName.trim()) {
      toast.error("Masukkan nama kategori baru");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("file", editFile);
      formData.append("category", editCategory);
      if (editCategory === "custom") {
        formData.append("newCategoryName", editNewCategoryName);
      }

      const res = await fetch(`/api/documents/templates/${editingTemplate.id}/update`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update template");

      toast.success("Template berhasil diperbarui!");
      setEditDialogOpen(false);
      setEditingTemplate(null);
      setEditFile(null);
      fetchTemplates();
    } catch (error) {
      toast.error("Gagal memperbarui template");
    } finally {
      setIsUpdating(false);
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "product_plan":
        return "📊";
      case "penawaran":
        return "📄";
      case "invoice":
        return "🧾";
      case "struk":
        return "🧾";
      default:
        return "📄";
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case "product_plan":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "penawaran":
        return "bg-green-100 text-green-700 border-green-200";
      case "invoice":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "struk":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTemplateLabel = (type: string) => {
    switch (type) {
      case "product_plan":
        return "Product Plan";
      case "penawaran":
        return "Surat Penawaran";
      case "invoice":
        return "Invoice";
      case "struk":
        return "Struk Kasir";
      default:
        return "Custom";
    }
  };

  // Dummy data for template preview
  const dummyData: Record<string, any> = {
    product_plan: {
      company_name: "PT Example Indonesia",
      product_name: "Aplikasi CRM Pro",
      overview: "Aplikasi CRM modern untuk mengelola pelanggan dan penjualan dengan fitur lengkap.",
      features: [
        { name: "Contact Management", description: "Kelola data pelanggan dengan mudah" },
        { name: "Sales Pipeline", description: "Tracking deals dari lead sampai closing" }
      ],
      timeline: [
        { date: "Q1 2026", milestone: "Launch Beta" },
        { date: "Q2 2026", milestone: "Full Release" }
      ],
      price: "2.500.000",
      pricing_notes: "Harga per tahun untuk unlimited users"
    },
    penawaran: {
      company_name: "PT PelangganPro",
      company_address: "Jl. Sudirman No. 123, Jakarta",
      company_phone: "021-12345678",
      company_email: "info@pelangganpro.id",
      no_surat: "SP/001/2026",
      tanggal: "27 Februari 2026",
      perihal: "Penawaran Jasa Pengembangan Website",
      recipient_name: "PT Klien Maju",
      recipient_address: "Jl. Thamrin No. 456, Jakarta",
      opening: "Bersama ini kami sampaikan penawaran harga untuk pengembangan website company profile.",
      items: [
        { no: "1", deskripsi: "Pembuatan Website Company Profile", jumlah: 1, harga: "15000000", total: "15000000" },
        { no: "2", deskripsi: "SEO Optimization", jumlah: 1, harga: "5000000", total: "5000000" }
      ],
      grand_total: "20000000",
      terms: "Pembayaran 50% di muka, 50% setelah project selesai. Garansi maintenance 3 bulan.",
      closing: "Demikian penawaran kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
      sender_name: "Ahmad Hidayat",
      sender_title: "Direktur"
    },
    invoice: {
      company_name: "PT PelangganPro",
      company_address: "Jl. Sudirman No. 123, Jakarta 10220",
      company_phone: "021-12345678",
      company_email: "billing@pelangganpro.id",
      invoice_number: "INV-2026-001",
      invoice_date: "27 Feb 2026",
      due_date: "27 Mar 2026",
      client_name: "PT Klien Maju",
      client_address: "Jl. Thamrin No. 456, Jakarta 10310",
      items: [
        { no: "1", description: "Lisensi CRM Premium (12 bulan)", qty: 1, price: "2500000", amount: "2500000" },
        { no: "2", description: "Setup & Training", qty: 1, price: "1500000", amount: "1500000" }
      ],
      subtotal: "4000000",
      tax_percent: "11",
      tax_amount: "440000",
      total: "4440000",
      bank_name: "Bank Central Asia (BCA)",
      bank_account: "1234567890",
      bank_account_name: "PT PelangganPro"
    },
    struk: {
      store_name: "TOKO SEJAHTERA",
      store_address: "Jl. Mawar No. 10, Jakarta",
      store_phone: "021-9876543",
      transaction_id: "TRX001",
      date: "27/02/2026 14:30",
      cashier: "Budi",
      items: [
        { name: "Indomie Goreng", qty: 2, price: "3500", total: "7000" },
        { name: "Teh Botol", qty: 1, price: "5000", total: "5000" },
        { name: "Sabun Mandi", qty: 1, price: "8000", total: "8000" }
      ],
      grand_total: "20000",
      paid: "50000",
      change: "30000"
    }
  };

  const renderTemplatePreview = (template: DocumentTemplate) => {
    const data = dummyData[template.type] || dummyData.product_plan;
    let html = template.html_template.replace("{{css_styles}}", template.css_styles);
    
    // Replace basic fields
    html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
    
    // Replace repeater fields
    html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
      const items = data[key];
      if (!Array.isArray(items)) return "";
      
      return items.map((item: any) => {
        let itemHtml = content;
        itemHtml = itemHtml.replace(/\{\{(\w+)\}\}/g, (m: string, k: string) => {
          return item[k] !== undefined ? String(item[k]) : m;
        });
        return itemHtml;
      }).join("");
    });
    
    return html;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dokumen" 
        description="Buat dan kelola dokumen bisnis dengan template"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="create" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Buat Dokumen
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Dokumen Saya
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileStack className="h-4 w-4" />
            Template Dokumen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-0">
          <CreateDocumentTab 
            templates={templates} 
            loadingTemplates={loadingTemplates}
            getTemplateIcon={getTemplateIcon}
            getTemplateColor={getTemplateColor}
            getTemplateLabel={getTemplateLabel}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Dokumen Saya</h2>
            <p className="text-sm text-muted-foreground">
              Kelola dokumen yang sudah Anda buat
            </p>
          </div>

          {loadingDocuments ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada dokumen</h3>
              <p className="text-sm text-slate-500 mb-4">Buat dokumen baru dari tab "Buat Dokumen"</p>
              <Button onClick={() => setActiveTab("create")}>
                Buat Dokumen Baru
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getTemplateIcon(doc.template?.type || "custom")}
                        </span>
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.template?.name || "Custom"} • {new Date(doc.created_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === "generated" ? "default" : "secondary"}>
                          {doc.status === "generated" ? "Selesai" : "Draft"}
                        </Badge>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/documents/${doc.id}`)}
                        >
                          Lihat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Template Dokumen</h2>
              <p className="text-sm text-muted-foreground">
                Preview dan kelola template dokumen yang tersedia
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push("/documents/upload")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Upload Template Baru
            </Button>
          </div>

          {loadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
              <FileStack className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada template</h3>
              <p className="text-sm text-slate-500 mb-4">Upload template referensi untuk membuat template baru</p>
              <Button onClick={() => router.push("/documents/upload")}>
                Upload Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Preview Area */}
                  <div 
                    className="h-64 bg-white border-b overflow-hidden relative group cursor-pointer"
                    onClick={() => router.push(`/documents/templates/${template.id}`)}
                  >
                    <div 
                      className="transform scale-[0.35] origin-top-left w-[285%] h-[285%] overflow-hidden"
                      dangerouslySetInnerHTML={{ 
                        __html: renderTemplatePreview(template) 
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium line-clamp-1">{template.name}</h4>
                          {template.is_default && (
                            <Badge variant="secondary" className="text-xs shrink-0">Default</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-xs ${getTemplateColor(template.type)}`}>
                          {getTemplateLabel(template.type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                      {template.description || "Template dokumen"}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/documents/new?template=${template.id}`)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Buat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/documents/templates/${template.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={deletingTemplate === template.id}
                          >
                            {deletingTemplate === template.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600"
                            disabled={template.is_default}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Upload file referensi baru untuk memperbarui template "{editingTemplate?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pilih Kategori</Label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setEditCategory(category.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      editCategory === category.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium text-sm">{category.name}</span>
                      {editCategory === category.id && (
                        <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {editCategory === "custom" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label htmlFor="edit-new-category" className="mb-2 block">Nama Kategori Baru</Label>
                  <Input
                    id="edit-new-category"
                    placeholder="Contoh: Surat Kontrak, Nota Pengiriman, dll"
                    value={editNewCategoryName}
                    onChange={(e) => setEditNewCategoryName(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Upload File Referensi Baru</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="edit-file-upload"
                  className="hidden"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="edit-file-upload" className="cursor-pointer block">
                  <Pencil className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {editFile ? editFile.name : "Klik untuk upload file baru"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Support: PDF, DOCX, PNG, JPG (Max 10MB)
                  </p>
                </label>
              </div>

              {editFile && (
                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="flex-1 truncate">{editFile.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {(editFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateTemplate}
                disabled={!editFile || isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
