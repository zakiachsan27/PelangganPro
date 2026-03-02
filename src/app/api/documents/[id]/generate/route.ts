import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generatePDF, generateDOCX } from "@/lib/document-generator";

// POST /api/documents/[id]/generate — Generate PDF and DOCX
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: document } = await supabase
    .from("generated_documents")
    .select("*, template:document_templates(*)")
    .eq("id", id)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  try {
    // Generate HTML with data
    const html = renderTemplate(document.template.html_template, document.data, document.template.css_styles);

    // Generate PDF
    const pdfBuffer = await generatePDF(html);
    const pdfFileName = `${document.title.replace(/\s+/g, "_")}.pdf`;
    
    // Upload PDF to storage
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from("generated-documents")
      .upload(`${document.org_id}/${id}.pdf`, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (pdfError) throw new Error(`Failed to upload PDF: ${pdfError.message}`);

    // Generate DOCX
    const docxBuffer = await generateDOCX(html);
    const docxFileName = `${document.title.replace(/\s+/g, "_")}.docx`;

    // Upload DOCX to storage
    const { data: docxData, error: docxError } = await supabase.storage
      .from("generated-documents")
      .upload(`${document.org_id}/${id}.docx`, docxBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (docxError) throw new Error(`Failed to upload DOCX: ${docxError.message}`);

    // Get public URLs
    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from("generated-documents")
      .getPublicUrl(`${document.org_id}/${id}.pdf`);

    const { data: { publicUrl: docxUrl } } = supabase.storage
      .from("generated-documents")
      .getPublicUrl(`${document.org_id}/${id}.docx`);

    // Update document with URLs
    await supabase
      .from("generated_documents")
      .update({
        pdf_url: pdfUrl,
        docx_url: docxUrl,
        file_name: pdfFileName,
        status: "generated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      pdf_url: pdfUrl,
      docx_url: docxUrl,
      file_name: pdfFileName,
    });
  } catch (error: any) {
    console.error("[Generate Document] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate document" },
      { status: 500 }
    );
  }
}

// Helper function to render template with data
function renderTemplate(template: string, data: Record<string, any>, css: string): string {
  let html = template.replace("{{css_styles}}", css);
  
  // Simple template replacement
  // Handle basic fields
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
  
  // Handle repeater fields (simple implementation)
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
}
