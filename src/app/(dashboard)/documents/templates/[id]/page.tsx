"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { DocumentTemplate } from "@/types";

// Dummy data untuk preview
const dummyData: Record<string, any> = {
  product_plan: {
    company_name: "PT Example Indonesia",
    product_name: "Aplikasi CRM Pro",
    overview: "Aplikasi CRM modern untuk mengelola pelanggan dan penjualan dengan fitur lengkap.",
    features: [
      { name: "Contact Management", description: "Kelola data pelanggan dengan mudah" },
      { name: "Sales Pipeline", description: "Tracking deals dari lead sampai closing" },
      { name: "Reporting", description: "Laporan otomatis dan analytics" }
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

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  async function fetchTemplate() {
    try {
      const res = await fetch(`/api/documents/templates/${templateId}`);
      if (!res.ok) throw new Error("Template not found");
      const data = await res.json();
      setTemplate(data);
    } catch (error) {
      toast.error("Gagal memuat template");
      router.push("/documents");
    } finally {
      setLoading(false);
    }
  }

  const renderPreview = () => {
    if (!template) return "";
    
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/documents")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-sm text-muted-foreground">Preview Template</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/documents/new?template=${template.id}`)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Buat Dokumen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg overflow-hidden bg-white"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipe</label>
                <Badge className="mt-1 block w-fit">
                  {template.type === "product_plan" && "Product Plan"}
                  {template.type === "penawaran" && "Surat Penawaran"}
                  {template.type === "invoice" && "Invoice"}
                  {template.type === "struk" && "Struk Kasir"}
                  {template.type === "custom" && "Custom"}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                <p className="text-sm mt-1">{template.description || "-"}</p>
              </div>

              {template.is_default && (
                <div>
                  <Badge variant="secondary">Template Default</Badge>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Dibuat</label>
                <p className="text-sm mt-1">
                  {new Date(template.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field yang Diperlukan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {template.form_schema?.fields?.map((field: any) => (
                  <li key={field.name} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="flex-1">{field.label}</span>
                    {field.required && (
                      <Badge variant="secondary" className="text-xs">Wajib</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
