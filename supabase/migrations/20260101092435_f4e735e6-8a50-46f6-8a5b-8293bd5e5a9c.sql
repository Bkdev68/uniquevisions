-- Portfolio Projects Table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  client TEXT,
  image_url TEXT,
  video_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en')),
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Testimonials Table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  quote TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en')),
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog/Insights Table
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  featured_image TEXT,
  slug TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en')),
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact Form Submissions Table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  package TEXT,
  message TEXT NOT NULL,
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Site Settings / CMS Content Table
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value_de TEXT,
  value_en TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'html', 'image', 'video')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section, key)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published projects" 
ON public.projects FOR SELECT 
USING (is_published = true);

CREATE POLICY "Public can view published testimonials" 
ON public.testimonials FOR SELECT 
USING (is_published = true);

CREATE POLICY "Public can view published insights" 
ON public.insights FOR SELECT 
USING (is_published = true);

CREATE POLICY "Public can view site content" 
ON public.site_content FOR SELECT 
USING (true);

-- Anyone can submit contact form
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions FOR INSERT 
WITH CHECK (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON public.insights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial site content (editable via CMS)
INSERT INTO public.site_content (section, key, value_de, value_en, type) VALUES
('hero', 'headline', 'Professioneller Foto- & Video-Content mit klarer Wirkung.', 'Professional Photo & Video Content with Clear Impact.', 'text'),
('hero', 'subheadline', 'Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.', 'Tailored packages for businesses, brands, agencies & private clients.', 'text'),
('about', 'title', 'Visuelle Inhalte mit Anspruch', 'Visual Content with Purpose', 'text'),
('about', 'description', 'Ich realisiere hochwertige Foto- und Videoproduktionen für Marken, Unternehmen und Events – klar geplant, qualitativ umgesetzt und flexibel an Ihre Ziele angepasst.', 'I create high-quality photo and video productions for brands, companies and events – clearly planned, quality implemented and flexibly adapted to your goals.', 'text'),
('about', 'tagline', 'Inhalte, die wirken – und nachhaltig überzeugen.', 'Content that works – and convinces sustainably.', 'text'),
('contact', 'title', 'Kontaktanfrage', 'Contact Request', 'text'),
('contact', 'description', 'Teilen Sie Ihre Anforderungen – anschließend besprechen wir den optimalen Rahmen für Ihr Projekt.', 'Share your requirements – then we will discuss the optimal framework for your project.', 'text'),
('seo', 'meta_title', 'UniqueVisions | Professioneller Foto- & Video-Content', 'UniqueVisions | Professional Photo & Video Content', 'text'),
('seo', 'meta_description', 'Maßgeschneiderte Foto- und Videoproduktionen für Unternehmen, Marken, Agenturen & Privatkunden.', 'Tailored photo and video productions for businesses, brands, agencies & private clients.', 'text');

-- Insert sample testimonials
INSERT INTO public.testimonials (name, company, quote, language, display_order) VALUES
('Maria S.', 'Hotel & Spa Resort', 'Die Zusammenarbeit war professionell und die Ergebnisse haben unsere Erwartungen übertroffen. Absolute Empfehlung!', 'de', 1),
('Thomas K.', 'Event Agentur', 'Kreativ, zuverlässig und mit einem Auge fürs Detail. Unsere Event-Dokumentation war ein voller Erfolg.', 'de', 2),
('Sarah M.', 'Marketing Director', 'Von der ersten Idee bis zum fertigen Video – alles aus einer Hand und in höchster Qualität.', 'de', 3);

-- Insert sample projects
INSERT INTO public.projects (title, description, role, client, image_url, language, display_order) VALUES
('Landschaften', 'Atemberaubende Naturaufnahmen', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'de', 1),
('Portraits', 'Ausdrucksstarke Portraitfotografie', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', 'de', 2),
('Architektur', 'Moderne und klassische Bauwerke', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', 'de', 3),
('Natur', 'Flora und Fauna im Detail', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', 'de', 4),
('Urban', 'Stadtleben und Streetfotografie', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', 'de', 5),
('Events', 'Besondere Momente festgehalten', 'Fotografie', NULL, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', 'de', 6);