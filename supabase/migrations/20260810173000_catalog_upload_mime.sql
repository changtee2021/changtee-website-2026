-- Allow PDF catalog downloads + slightly larger catalog page images in the public uploads bucket.

UPDATE storage.buckets
SET
  file_size_limit = 41943040,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/json'
  ]
WHERE id = 'changtee-uploads';
