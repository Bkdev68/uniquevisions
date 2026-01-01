-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow public read access to project images
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow admins to upload project images
CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update project images
CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete project images
CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);