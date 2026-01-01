-- Add settings table for email configuration
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read settings
CREATE POLICY "Public can view settings"
ON public.settings FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can insert settings"
ON public.settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notification email
INSERT INTO public.settings (key, value) VALUES ('notification_email', 'kontakt@uniquevisions.at');