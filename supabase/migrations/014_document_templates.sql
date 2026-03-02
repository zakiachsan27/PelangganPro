-- ============================================
-- 014: Document Templates and Generated Documents Tables
-- ============================================

-- ============================================
-- 1. Document Templates
-- ============================================
CREATE TABLE document_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('product_plan', 'penawaran', 'invoice', 'struk', 'custom')),
  description TEXT,
  ref_file_url TEXT,
  ref_file_name TEXT,
  html_template TEXT NOT NULL,
  css_styles  TEXT NOT NULL,
  form_schema JSONB NOT NULL DEFAULT '{}',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Generated Documents
-- ============================================
CREATE TABLE generated_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id   UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}',
  pdf_url       TEXT,
  docx_url      TEXT,
  file_name     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated')),
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Indexes
-- ============================================
CREATE INDEX idx_document_templates_org ON document_templates(org_id);
CREATE INDEX idx_document_templates_type ON document_templates(type);
CREATE INDEX idx_document_templates_active ON document_templates(is_active);
CREATE INDEX idx_generated_documents_org ON generated_documents(org_id);
CREATE INDEX idx_generated_documents_template ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_status ON generated_documents(status);
CREATE INDEX idx_generated_documents_created ON generated_documents(created_at);

-- ============================================
-- 4. RLS Policies
-- ============================================
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Document Templates policies
CREATE POLICY "Users can view document templates in their org"
ON document_templates FOR SELECT
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create document templates in their org"
ON document_templates FOR INSERT
TO authenticated
WITH CHECK (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update document templates in their org"
ON document_templates FOR UPDATE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete document templates in their org"
ON document_templates FOR DELETE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

-- Generated Documents policies
CREATE POLICY "Users can view documents in their org"
ON generated_documents FOR SELECT
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create documents in their org"
ON generated_documents FOR INSERT
TO authenticated
WITH CHECK (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update their documents"
ON generated_documents FOR UPDATE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their documents"
ON generated_documents FOR DELETE
TO authenticated
USING (org_id IN (
  SELECT org_id FROM profiles WHERE id = auth.uid()
));

-- ============================================
-- 5. Create Storage Bucket for Documents
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-documents',
  'generated-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated uploads to documents bucket
CREATE POLICY "Allow authenticated uploads to documents bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-documents'
);

-- Allow public read access to documents
CREATE POLICY "Allow public read access to documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-documents');

-- Note: Default templates should be inserted manually via API after migration
-- They require org_id which cannot be NULL
-- See: /api/documents/templates/seed endpoint or run seed-templates.sql
