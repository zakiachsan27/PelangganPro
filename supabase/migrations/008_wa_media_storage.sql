-- Create wa-media storage bucket for WhatsApp file attachments
-- Public bucket so wa-bridge can download via URL without user auth
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wa-media',
  'wa-media',
  true,
  5242880,  -- 5MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
);

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload wa media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wa-media');

-- Anyone can read (public bucket for wa-bridge access)
CREATE POLICY "Public can read wa media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wa-media');
