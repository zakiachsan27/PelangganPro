"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Save, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { DocumentTemplate, FormField } from "@/types";

// Wrapper component to handle Suspense
export default function NewDocumentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <NewDocumentContent />
    </Suspense>
  );
}

function NewDocumentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");
  
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [title, setTitle] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    } else {
      setLoading(false);
      toast.error("Pilih template terlebih dahulu");
      router.push("/documents");
    }
  }, [templateId]);

  async function fetchTemplate() {
    try {
      const res = await fetch(`/api/documents/templates/${templateId}`);
      if (!res.ok) throw new Error("Template not found");
      const data = await res.json();
      setTemplate(data);
      
      // Initialize form with default values
      const initialData: Record<string, any> = {};
      data.form_schema?.fields?.forEach((field: FormField) => {
        if (field.type === "repeater") {
          initialData[field.name] = [];
        } else {
          initialData[field.name] = "";
        }
      });
      setFormData(initialData);
      
      // Set default title
      setTitle(`${data.name} - ${new Date().toLocaleDateString("id-ID")}`);
    } catch (error) {
      toast.error("Gagal memuat template");
      router.push("/documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(asDraft = true) {
    setSaving(true);
    try {
      const url = documentId ? `/api/documents/${documentId}` : "/api/documents";
      const method = documentId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          title,
          data: formData,
          status: asDraft ? "draft" : "generated",
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const result = await res.json();
      if (!documentId) setDocumentId(result.id);
      
      toast.success(asDraft ? "Draft disimpan" : "Dokumen berhasil dibuat");
      return result.id;
    } catch (error) {
      toast.error("Gagal menyimpan dokumen");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      // First save the document
      const docId = documentId || await handleSave(false);
      if (!docId) return;

      // Then generate PDF and DOCX
      const res = await fetch(`/api/documents/${docId}/generate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to generate");
      
      const result = await res.json();
      toast.success("Dokumen berhasil digenerate!");
      
      // Redirect to view page
      router.push(`/documents/${docId}`);
    } catch (error) {
      toast.error("Gagal generate dokumen");
    } finally {
      setGenerating(false);
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    
    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
          />
        );
      
      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
            rows={4}
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
          />
        );
      
      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        );
      
      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(v) => setFormData({ ...formData, [field.name]: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.label} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "repeater":
        return (
          <div className="space-y-2">
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                {field.fields?.map((subField) => (
                  <div key={subField.name}>
                    <Label className="text-xs">{subField.label}</Label>
                    <Input
                      value={item[subField.name] || ""}
                      onChange={(e) => {
                        const newItems = [...value];
                        newItems[index] = { ...item, [subField.name]: e.target.value };
                        setFormData({ ...formData, [field.name]: newItems });
                      }}
                      placeholder={subField.label}
                      className="mt-1"
                    />
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const newItems = value.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, [field.name]: newItems });
                  }}
                >
                  Hapus
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem: Record<string, string> = {};
                field.fields?.forEach((f) => (newItem[f.name] = ""));
                setFormData({ ...formData, [field.name]: [...(value || []), newItem] });
              }}
            >
              + Tambah Item
            </Button>
          </div>
        );
      
      default:
        return <Input value={value || ""} readOnly />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buat Dokumen Baru</h1>
          <p className="text-muted-foreground">Template: {template.name}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Simpan Draft
          </Button>
          
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-1" />
                Generate Dokumen
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Judul Dokumen</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul dokumen"
                className="mt-1"
              />
            </div>
            
            {template.form_schema?.fields?.map((field) => (
              <div key={field.name}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                <div className="mt-1">{renderField(field)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="text-sm text-muted-foreground text-center py-8">
                Preview akan muncul setelah generate dokumen
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
