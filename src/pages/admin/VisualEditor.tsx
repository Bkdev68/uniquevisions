import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useTestimonials, useSiteContent } from "@/hooks/useContent";
import type { Project, Testimonial } from "@/hooks/useContent";
import { LanguageProvider } from "@/hooks/useLanguage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { EditProvider, useEditContext } from "@/contexts/EditContext";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditableHero } from "@/components/editor/EditableHero";
import { EditableAbout } from "@/components/editor/EditableAbout";
import { EditablePortfolio } from "@/components/editor/EditablePortfolio";
import { EditableServices } from "@/components/editor/EditableServices";
import { EditableTestimonials } from "@/components/editor/EditableTestimonials";
import { EditableFooter } from "@/components/editor/EditableFooter";
import { SortableSection } from "@/components/editor/SortableSection";
import { Contact } from "@/components/Contact";
import { Loader2 } from "lucide-react";

// Default data
const defaultServiceCategories = [
  { title: "THERME & SPA", image: "https://uniquevisions.at/wp-content/uploads/2025/12/Therme-Spa.jpg" },
  { title: "HOTEL & GASTRONOMIE", image: "https://uniquevisions.at/wp-content/uploads/2025/12/HotelGastronomie.jpg" },
  { title: "EVENTS & ELEGANZ", image: "https://uniquevisions.at/wp-content/uploads/2025/12/Events-Eleganz.jpg" },
];

const defaultFeatures = [
  "Hochwertige Bildsprache & Umsetzung",
  "Flexible Zusammenarbeit",
  "Klare Planung & Kommunikation",
  "Präzise Postproduktion",
];

const defaultServices = [
  { icon: "Palette", text: "Konzeption & visuelle Planung" },
  { icon: "Camera", text: "Foto- & Videoproduktion" },
  { icon: "Video", text: "Behind-the-Scenes & Detailaufnahmen" },
  { icon: "Edit", text: "Bild- & Videobearbeitung" },
  { icon: "Monitor", text: "Optimierung für Website & Social Media" },
];

const defaultPackages = [
  { title: "3-, 6- oder 12-Monats-Pakete", description: "Für Marken und Unternehmen, mit regelmäßigem Content-Bedarf.", icon: "Clock" },
  { title: "Individuelle Projekte", description: "Für einzelne Produktionen, Events oder besondere Anforderungen.", icon: "Camera" },
];

const VisualEditorContent: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setIsSaving } = useEditContext();

  // Fetch data
  const { data: projects = [], isLoading: projectsLoading } = useProjects("de");
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials("de");
  const { data: siteContent, isLoading: contentLoading } = useSiteContent();

  // Local state for editing
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [localTestimonials, setLocalTestimonials] = useState<Testimonial[]>([]);
  const [localContent, setLocalContent] = useState<Record<string, Record<string, { de: string; en: string }>>>({});
  const [serviceCategories, setServiceCategories] = useState(defaultServiceCategories);
  const [features, setFeatures] = useState(defaultFeatures);
  const [services, setServices] = useState(defaultServices);
  const [packages, setPackages] = useState(defaultPackages);
  const [hasChanges, setHasChanges] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "hero",
    "about",
    "portfolio",
    "services",
    "testimonials",
    "contact",
    "footer",
  ]);

  // DnD sensors for sections
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
      markChanged();
    }
  };

  // Sync fetched data to local state
  useEffect(() => {
    if (projects.length > 0) setLocalProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (testimonials.length > 0) setLocalTestimonials(testimonials);
  }, [testimonials]);

  useEffect(() => {
    if (siteContent) setLocalContent(siteContent);
  }, [siteContent]);

  // Track changes
  const markChanged = useCallback(() => setHasChanges(true), []);

  // Content change handler
  const handleContentChange = useCallback((section: string, key: string, value: string) => {
    setLocalContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: { ...prev[section]?.[key], de: value },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Project handlers
  const handleProjectUpdate = useCallback((updated: Project) => {
    setLocalProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    markChanged();
  }, [markChanged]);

  const handleProjectDelete = useCallback((id: string) => {
    setLocalProjects((prev) => prev.filter((p) => p.id !== id));
    markChanged();
  }, [markChanged]);

  const handleProjectAdd = useCallback(() => {
    const newProject: Project = {
      id: `new-${Date.now()}`,
      title: "Neues Projekt",
      description: "Beschreibung hinzufügen...",
      role: null,
      client: null,
      image_url: null,
      video_url: null,
      language: "de",
      display_order: localProjects.length,
      gallery: [],
    };
    setLocalProjects((prev) => [...prev, newProject]);
    markChanged();
  }, [localProjects.length, markChanged]);

  // Testimonial handlers
  const handleTestimonialUpdate = useCallback((updated: Testimonial) => {
    setLocalTestimonials((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    markChanged();
  }, [markChanged]);

  const handleTestimonialDelete = useCallback((id: string) => {
    setLocalTestimonials((prev) => prev.filter((t) => t.id !== id));
    markChanged();
  }, [markChanged]);

  const handleTestimonialAdd = useCallback(() => {
    const newTestimonial: Testimonial = {
      id: `new-${Date.now()}`,
      name: "Name",
      company: "Unternehmen",
      quote: "Zitat hinzufügen...",
      language: "de",
      display_order: localTestimonials.length,
    };
    setLocalTestimonials((prev) => [...prev, newTestimonial]);
    markChanged();
  }, [localTestimonials.length, markChanged]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<any>[] = [];

      // Save projects
      for (const project of localProjects) {
        if (project.id.startsWith("new-")) {
          const { error } = await supabase.from("projects").insert({
            title: project.title,
            description: project.description,
            role: project.role,
            client: project.client,
            image_url: project.image_url,
            video_url: project.video_url,
            language: project.language,
            display_order: project.display_order,
            gallery: JSON.parse(JSON.stringify(project.gallery)),
            is_published: true,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from("projects").update({
            title: project.title,
            description: project.description,
            role: project.role,
            client: project.client,
            image_url: project.image_url,
            video_url: project.video_url,
            display_order: project.display_order,
            gallery: JSON.parse(JSON.stringify(project.gallery)),
          }).eq("id", project.id);
          if (error) throw error;
        }
      }

      // Delete removed projects
      const currentProjectIds = localProjects.map((p) => p.id).filter((id) => !id.startsWith("new-"));
      const originalProjectIds = projects.map((p) => p.id);
      const deletedProjectIds = originalProjectIds.filter((id) => !currentProjectIds.includes(id));
      for (const id of deletedProjectIds) {
        await supabase.from("projects").delete().eq("id", id);
      }

      // Save testimonials
      for (const testimonial of localTestimonials) {
        if (testimonial.id.startsWith("new-")) {
          const { error } = await supabase.from("testimonials").insert({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            language: testimonial.language,
            display_order: testimonial.display_order,
            is_published: true,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from("testimonials").update({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            display_order: testimonial.display_order,
          }).eq("id", testimonial.id);
          if (error) throw error;
        }
      }

      // Delete removed testimonials
      const currentTestimonialIds = localTestimonials.map((t) => t.id).filter((id) => !id.startsWith("new-"));
      const originalTestimonialIds = testimonials.map((t) => t.id);
      const deletedTestimonialIds = originalTestimonialIds.filter((id) => !currentTestimonialIds.includes(id));
      for (const id of deletedTestimonialIds) {
        await supabase.from("testimonials").delete().eq("id", id);
      }

      // Save site content
      for (const [section, keys] of Object.entries(localContent)) {
        for (const [key, values] of Object.entries(keys)) {
          await supabase.from("site_content").upsert({
            section,
            key,
            value_de: values.de,
            value_en: values.en || values.de,
          }, { onConflict: "section,key" });
        }
      }
    },
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      setHasChanges(false);
      toast({ title: "Gespeichert!", description: "Alle Änderungen wurden erfolgreich gespeichert." });
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({ title: "Fehler", description: "Beim Speichern ist ein Fehler aufgetreten.", variant: "destructive" });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleReset = useCallback(() => {
    setLocalProjects(projects);
    setLocalTestimonials(testimonials);
    setLocalContent(siteContent || {});
    setHasChanges(false);
  }, [projects, testimonials, siteContent]);

  const isLoading = projectsLoading || testimonialsLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Simulated Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-logo font-semibold tracking-tight">UNIQUEVISIONS</span>
          <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            Visual Editor
          </span>
        </div>
      </header>

      <main className="pt-16">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            {sectionOrder.map((sectionId) => {
              switch (sectionId) {
                case "hero":
                  return (
                    <SortableSection key="hero" id="hero" name="Hero">
                      <EditableHero
                        content={localContent}
                        onContentChange={handleContentChange}
                        serviceCategories={serviceCategories}
                        onServiceCategoriesChange={(cats) => { setServiceCategories(cats); markChanged(); }}
                      />
                    </SortableSection>
                  );
                case "about":
                  return (
                    <SortableSection key="about" id="about" name="Über mich">
                      <EditableAbout
                        content={localContent}
                        onContentChange={handleContentChange}
                        features={features}
                        onFeaturesChange={(f) => { setFeatures(f); markChanged(); }}
                      />
                    </SortableSection>
                  );
                case "portfolio":
                  return (
                    <SortableSection key="portfolio" id="portfolio" name="Portfolio">
                      <EditablePortfolio
                        content={localContent}
                        onContentChange={handleContentChange}
                        projects={localProjects}
                        onProjectUpdate={handleProjectUpdate}
                        onProjectDelete={handleProjectDelete}
                        onProjectAdd={handleProjectAdd}
                        onProjectsReorder={(reordered) => { setLocalProjects(reordered); markChanged(); }}
                      />
                    </SortableSection>
                  );
                case "services":
                  return (
                    <SortableSection key="services" id="services" name="Dienstleistungen">
                      <EditableServices
                        content={localContent}
                        onContentChange={handleContentChange}
                        services={services}
                        onServicesChange={(s) => { setServices(s); markChanged(); }}
                        packages={packages}
                        onPackagesChange={(p) => { setPackages(p); markChanged(); }}
                      />
                    </SortableSection>
                  );
                case "testimonials":
                  return (
                    <SortableSection key="testimonials" id="testimonials" name="Testimonials">
                      <EditableTestimonials
                        content={localContent}
                        onContentChange={handleContentChange}
                        testimonials={localTestimonials}
                        onTestimonialUpdate={handleTestimonialUpdate}
                        onTestimonialDelete={handleTestimonialDelete}
                        onTestimonialAdd={handleTestimonialAdd}
                        onTestimonialsReorder={(reordered) => { setLocalTestimonials(reordered); markChanged(); }}
                      />
                    </SortableSection>
                  );
                case "contact":
                  return (
                    <SortableSection key="contact" id="contact" name="Kontakt">
                      <Contact />
                    </SortableSection>
                  );
                case "footer":
                  return (
                    <SortableSection key="footer" id="footer" name="Footer">
                      <EditableFooter content={localContent} onContentChange={handleContentChange} />
                    </SortableSection>
                  );
                default:
                  return null;
              }
            })}
          </SortableContext>
        </DndContext>
      </main>

      <EditorToolbar
        onSave={() => saveMutation.mutate()}
        onReset={handleReset}
        hasChanges={hasChanges}
      />
    </div>
  );
};

const VisualEditor: React.FC = () => {
  return (
    <LanguageProvider>
      <EditProvider>
        <VisualEditorContent />
      </EditProvider>
    </LanguageProvider>
  );
};

export default VisualEditor;
