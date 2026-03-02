import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const newCategoryName = formData.get("newCategoryName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "No category selected" }, { status: 400 });
    }

    // Determine template type
    let templateType = category;
    let templateName = "";

    if (category === "custom" && newCategoryName) {
      // Create a slug for custom category
      templateType = newCategoryName.toLowerCase().replace(/\s+/g, "_");
      templateName = newCategoryName;
    } else {
      // Map category to template name
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

    // TODO: Trigger AI analysis here
    // For now, just return success with file info
    
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully. AI will analyze the document.",
      data: {
        file_url: publicUrl,
        file_name: file.name,
        category: templateType,
        category_name: templateName,
        file_path: filePath
      }
    });

  } catch (error) {
    console.error("[Upload API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
