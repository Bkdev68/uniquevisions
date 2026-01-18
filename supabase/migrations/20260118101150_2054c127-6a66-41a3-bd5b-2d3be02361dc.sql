-- Add avatar_url column to testimonials for mini profile images
ALTER TABLE public.testimonials
ADD COLUMN avatar_url TEXT;