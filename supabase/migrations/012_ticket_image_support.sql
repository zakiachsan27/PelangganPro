-- Add image_url column to tickets table and create crm-media storage bucket

-- Add image_url column to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create crm-media storage bucket for CRM file attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crm-media',
  'crm-media',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to crm-media bucket
CREATE POLICY "Allow authenticated uploads to crm-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'crm-media'
  AND (storage.foldername(name))[1] = 'ticket-attachments'
);

-- Allow public read access to crm-media bucket
CREATE POLICY "Allow public read access to crm-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'crm-media');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from crm-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'crm-media'
  AND (storage.foldername(name))[1] = 'ticket-attachments'
);
