import React, { useState, useEffect, useCallback } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { EditProvider, useEditContext } from "@/contexts/EditContext";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { GridItem } from "@/components/editor/GridItem";
import { EditableText } from "@/components/editor/EditableText";
import { EditableImage } from "@/components/editor/EditableImage";
import { EditableAlbumCard } from "@/components/editor/EditableAlbumCard";
import { EditableTestimonialCard } from "@/components/editor/EditableTestimonialCard";
import { AddItemButton } from "@/components/editor/AddItemButton";
import { AlbumViewer } from "@/components/portfolio/AlbumViewer";
import { Contact } from "@/components/Contact";
import { Loader2, Plus, Type, Image, Columns, Layout, Film, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GridElementType = 
  | "heading" 
  | "subheading" 
  | "text" 
  | "image" 
  | "project" 
  | "testimonial" 
  | "spacer"
  | "service-card"
  | "feature-item"
  | "contact-section";

export interface GridElement {
  id: string;
  type: GridElementType;
  content: string;
  colSpan?: 1 | 2 | 3;
  data?: any; // For complex elements like projects/testimonials
}

// Helper to create initial grid from content
const createInitialGrid = (
  content: Record<string, Record<string, { de: string; en: string }>> | undefined,
  projects: Project[],
  testimonials: Testimonial[]
): GridElement[] => {
  const elements: GridElement[] = [];
  let order = 0;

  // Hero Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.hero?.headline?.de || "Professioneller Foto- & Video-Content mit klarer Wirkung.",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "subheading",
    content: content?.hero?.subheadline?.de || "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/Therme-Spa.jpg",
    colSpan: 1,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/HotelGastronomie.jpg",
    colSpan: 1,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/Events-Eleganz.jpg",
    colSpan: 1,
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // About Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.about?.title?.de || "Visuelle Inhalte mit Anspruch",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "text",
    content: content?.about?.description1?.de || "Ich realisiere hochwertige Foto- und Videoproduktionen für Marken, Unternehmen und Events.",
    colSpan: 3,
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // Portfolio Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.portfolio?.title?.de || "Portfolio",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "subheading",
    content: content?.portfolio?.subtitle?.de || "Referenzen aus realen Projekten.",
    colSpan: 3,
  });

  // Add projects
  projects.forEach((project) => {
    elements.push({
      id: `project-${project.id}`,
      type: "project",
      content: project.title,
      colSpan: 1,
      data: project,
    });
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // Testimonials Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.testimonials?.title?.de || "Kundenstimmen",
    colSpan: 3,
  });

  // Add testimonials
  testimonials.forEach((testimonial) => {
    elements.push({
      id: `testimonial-${testimonial.id}`,
      type: "testimonial",
      content: testimonial.quote,
      colSpan: 1,
      data: testimonial,
    });
  });

  // Contact Section
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });
  elements.push({
    id: `contact-section`,
    type: "contact-section",
    content: "",
    colSpan: 3,
  });

  return elements;
};

const VisualEditorContent: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isEditMode, setIsSaving } = useEditContext();

  // Fetch data
  const { data: projects = [], isLoading: projectsLoading } = useProjects("de");
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials("de");
  const { data: siteContent, isLoading: contentLoading } = useSiteContent();

  // Grid elements state
  const [gridElements, setGridElements] = useState<GridElement[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Project | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize grid from data
  useEffect(() => {
    if (!projectsLoading && !testimonialsLoading && !contentLoading) {
      setGridElements(createInitialGrid(siteContent, projects, testimonials));
    }
  }, [projects, testimonials, siteContent, projectsLoading, testimonialsLoading, contentLoading]);

  const markChanged = useCallback(() => setHasChanges(true), []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setGridElements((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === active.id);
        const newIndex = prev.findIndex((e) => e.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      markChanged();
    }
  }, [markChanged]);

  const updateElement = useCallback((id: string, updates: Partial<GridElement>) => {
    setGridElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    markChanged();
  }, [markChanged]);

  const deleteElement = useCallback((id: string) => {
    setGridElements((prev) => prev.filter((el) => el.id !== id));
    markChanged();
  }, [markChanged]);

  const addElement = useCallback((type: GridElementType) => {
    const newElement: GridElement = {
      id: `el-${Date.now()}`,
      type,
      content: type === "heading" 
        ? "Neue Überschrift" 
        : type === "subheading" 
        ? "Neue Unterüberschrift"
        : type === "text" 
        ? "Neuer Text hier..." 
        : "",
      colSpan: type === "heading" || type === "subheading" || type === "text" || type === "spacer" ? 3 : 1,
    };
    
    if (type === "project") {
      newElement.data = {
        id: `new-${Date.now()}`,
        title: "Neues Projekt",
        description: "Beschreibung...",
        gallery: [],
      } as Project;
      newElement.content = "Neues Projekt";
    }
    
    if (type === "testimonial") {
      newElement.data = {
        id: `new-${Date.now()}`,
        name: "Name",
        company: "Unternehmen",
        quote: "Zitat...",
      } as Testimonial;
      newElement.content = "Zitat...";
    }
    
    setGridElements((prev) => [...prev, newElement]);
    setShowAddMenu(false);
    markChanged();
  }, [markChanged]);

  const cycleColSpan = useCallback((id: string) => {
    setGridElements((prev) => {
      return prev.map((el) => {
        if (el.id === id) {
          const nextSpan = ((el.colSpan || 1) % 3) + 1 as 1 | 2 | 3;
          return { ...el, colSpan: nextSpan };
        }
        return el;
      });
    });
    markChanged();
  }, [markChanged]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Extract and save projects
      const projectElements = gridElements.filter((e) => e.type === "project" && e.data);
      for (let i = 0; i < projectElements.length; i++) {
        const project = projectElements[i].data as Project;
        if (project.id.startsWith("new-")) {
          await supabase.from("projects").insert({
            title: project.title,
            description: project.description,
            image_url: project.image_url,
            gallery: JSON.parse(JSON.stringify(project.gallery || [])),
            display_order: i,
            language: "de",
            is_published: true,
          });
        } else {
          await supabase.from("projects").update({
            title: project.title,
            description: project.description,
            image_url: project.image_url,
            gallery: JSON.parse(JSON.stringify(project.gallery || [])),
            display_order: i,
          }).eq("id", project.id);
        }
      }

      // Extract and save testimonials
      const testimonialElements = gridElements.filter((e) => e.type === "testimonial" && e.data);
      for (let i = 0; i < testimonialElements.length; i++) {
        const testimonial = testimonialElements[i].data as Testimonial;
        if (testimonial.id.startsWith("new-")) {
          await supabase.from("testimonials").insert({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            display_order: i,
            language: "de",
            is_published: true,
          });
        } else {
          await supabase.from("testimonials").update({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            display_order: i,
          }).eq("id", testimonial.id);
        }
      }

      // Save content from headings/text
      const contentMap: Record<string, Record<string, string>> = {};
      gridElements.forEach((el, index) => {
        if (el.type === "heading" && index === 0) {
          if (!contentMap.hero) contentMap.hero = {};
          contentMap.hero.headline = el.content;
        }
        if (el.type === "subheading" && index === 1) {
          if (!contentMap.hero) contentMap.hero = {};
          contentMap.hero.subheadline = el.content;
        }
      });

      for (const [section, keys] of Object.entries(contentMap)) {
        for (const [key, value] of Object.entries(keys)) {
          await supabase.from("site_content").upsert({
            section,
            key,
            value_de: value,
            value_en: value,
          }, { onConflict: "section,key" });
        }
      }
    },
    onMutate: () => setIsSaving(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      setHasChanges(false);
      toast({ title: "Gespeichert!", description: "Änderungen wurden gespeichert." });
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen.", variant: "destructive" });
    },
    onSettled: () => setIsSaving(false),
  });

  const handleReset = useCallback(() => {
    setGridElements(createInitialGrid(siteContent, projects, testimonials));
    setHasChanges(false);
  }, [siteContent, projects, testimonials]);

  const isLoading = projectsLoading || testimonialsLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderElement = (element: GridElement) => {
    switch (element.type) {
      case "heading":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-center"
          />
        );
      case "subheading":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="p"
            className="text-lg text-muted-foreground text-center"
          />
        );
      case "text":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="p"
            multiline
            className="text-muted-foreground leading-relaxed"
          />
        );
      case "image":
        return (
          <EditableImage
            src={element.content}
            alt="Grid Image"
            onChange={(url) => updateElement(element.id, { content: url })}
            aspectRatio="4/3"
            className="rounded-lg overflow-hidden"
          />
        );
      case "project":
        if (!element.data) return null;
        return (
          <div 
            onClick={() => !isEditMode && setSelectedAlbum(element.data)}
            className={!isEditMode ? "cursor-pointer" : ""}
          >
            <EditableAlbumCard
              project={element.data}
              onUpdate={(updated) => updateElement(element.id, { data: updated, content: updated.title })}
              onDelete={() => deleteElement(element.id)}
            />
          </div>
        );
      case "testimonial":
        if (!element.data) return null;
        return (
          <EditableTestimonialCard
            testimonial={element.data}
            onUpdate={(updated) => updateElement(element.id, { data: updated, content: updated.quote })}
            onDelete={() => deleteElement(element.id)}
          />
        );
      case "spacer":
        return <div className="h-12 md:h-20" />;
      case "contact-section":
        return <Contact />;
      default:
        return null;
    }
  };

  const getColSpanClass = (colSpan?: number) => {
    switch (colSpan) {
      case 2: return "md:col-span-2";
      case 3: return "md:col-span-2 lg:col-span-3";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-logo font-semibold tracking-tight">UNIQUEVISIONS</span>
          <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            Grid Editor
          </span>
        </div>
      </header>

      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          {isEditMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={gridElements.map((e) => e.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridElements.map((element) => (
                    <GridItem
                      key={element.id}
                      id={element.id}
                      colSpan={element.colSpan}
                      onDelete={() => deleteElement(element.id)}
                      onCycleSpan={() => cycleColSpan(element.id)}
                      type={element.type}
                    >
                      {renderElement(element)}
                    </GridItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridElements.map((element) => (
                <div
                  key={element.id}
                  className={cn("py-2", getColSpanClass(element.colSpan))}
                >
                  {renderElement(element)}
                </div>
              ))}
            </div>
          )}

          {/* Add Element Button */}
          {isEditMode && (
            <div className="mt-8 flex justify-center">
              {showAddMenu ? (
                <div className="flex flex-wrap items-center justify-center gap-2 bg-card border border-border rounded-lg p-3 shadow-lg">
                  <Button size="sm" variant="ghost" onClick={() => addElement("heading")} className="flex items-center gap-2">
                    <Type className="w-4 h-4" /> Überschrift
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("subheading")} className="flex items-center gap-2">
                    <Type className="w-4 h-4 opacity-60" /> Unterüberschrift
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("text")} className="flex items-center gap-2">
                    <Columns className="w-4 h-4" /> Text
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("image")} className="flex items-center gap-2">
                    <Image className="w-4 h-4" /> Bild
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("project")} className="flex items-center gap-2">
                    <Film className="w-4 h-4" /> Projekt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("testimonial")} className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Testimonial
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("spacer")} className="flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Abstand
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddMenu(false)}>✕</Button>
                </div>
              ) : (
                <Button variant="outline" size="lg" onClick={() => setShowAddMenu(true)} className="flex items-center gap-2 border-dashed">
                  <Plus className="w-5 h-5" /> Element hinzufügen
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <EditorToolbar
        onSave={() => saveMutation.mutate()}
        onReset={handleReset}
        hasChanges={hasChanges}
      />

      {/* Album Viewer */}
      {selectedAlbum && !isEditMode && (
        <AlbumViewer
          isOpen={!!selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          title={selectedAlbum.title}
          images={selectedAlbum.gallery}
        />
      )}
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
