import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  role: string | null;
  client: string | null;
  image_url: string | null;
  video_url: string | null;
  language: string;
  display_order: number | null;
}

export const useProjects = (language: string = "de") => {
  return useQuery({
    queryKey: ["projects", language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("language", language)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Project[];
    },
  });
};

export interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  quote: string;
  language: string;
  display_order: number | null;
}

export const useTestimonials = (language: string = "de") => {
  return useQuery({
    queryKey: ["testimonials", language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("language", language)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  value_de: string | null;
  value_en: string | null;
  type: string | null;
}

export const useSiteContent = () => {
  return useQuery({
    queryKey: ["siteContent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*");

      if (error) throw error;
      
      // Transform into a more usable format
      const content: Record<string, Record<string, { de: string; en: string }>> = {};
      (data as SiteContent[]).forEach((item) => {
        if (!content[item.section]) {
          content[item.section] = {};
        }
        content[item.section][item.key] = {
          de: item.value_de || "",
          en: item.value_en || "",
        };
      });
      return content;
    },
  });
};
