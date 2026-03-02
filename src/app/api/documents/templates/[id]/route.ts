import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/documents/templates/[id] — Get single template
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// PATCH /api/documents/templates/[id] — Update template
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("document_templates")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  const allowedFields = [
    "name", "description", "html_template", "css_styles", 
    "form_schema", "is_active", "ref_file_url", "ref_file_name"
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("document_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/documents/templates/[id] — Delete template
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("document_templates")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const { error } = await supabase
    .from("document_templates")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

// POST /api/documents/templates/[id]/update — Update template with file upload
// Special handling: If editing a default template, create a new org-specific copy instead
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if template exists and get full details
    const { data: existing } = await supabase
      .from("document_templates")
      .select("id, type, name, is_default, html_template, css_styles, form_schema, description")
      .eq("id", id)
      .single();
    
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const newCategoryName = formData.get("newCategoryName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine template type and name
    let templateType = category;
    let templateName = "";

    if (category === "custom" && newCategoryName) {
      templateType = newCategoryName.toLowerCase().replace(/\s+/g, "_");
      templateName = newCategoryName;
    } else {
      const categoryNames: Record<string, string> = {
        invoice: "Invoice",
        penawaran: "Surat Penawaran",
        struk: "Struk Kasir",
        product_plan: "Product Plan"
      };
      templateName = categoryNames[category] || category;
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `template-refs/${profile.org_id}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("template-references")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[Upload Error]", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("template-references")
      .getPublicUrl(filePath);

    // Check if this is a default template
    if (existing.is_default) {
      // If editing a default template, CREATE A NEW org-specific template
      // The default template remains untouched for other organizations
      const { data: newTemplate, error: createError } = await supabase
        .from("document_templates")
        .insert({
          org_id: profile.org_id,
          name: `${templateName} (Custom)`,
          type: templateType,
          description: `Custom version of ${existing.name}`,
          ref_file_url: publicUrl,
          ref_file_name: file.name,
          html_template: existing.html_template, // Will be updated by AI analysis later
          css_styles: existing.css_styles,
          form_schema: existing.form_schema,
          is_default: false, // Important: This is NOT a default template
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error("[Create Error]", createError);
        return NextResponse.json({ error: "Failed to create custom template" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Template custom berhasil dibuat",
        data: newTemplate,
        isNewTemplate: true
      });
    } else {
      // If editing an org-specific template, UPDATE it normally
      const { data: updatedTemplate, error: updateError } = await supabase
        .from("document_templates")
        .update({
          type: templateType,
          name: templateName,
          ref_file_url: publicUrl,
          ref_file_name: file.name,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("[Update Error]", updateError);
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Template berhasil diperbarui",
        data: updatedTemplate,
        isNewTemplate: false
      });
    }

  } catch (error) {
    console.error("[Update API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
